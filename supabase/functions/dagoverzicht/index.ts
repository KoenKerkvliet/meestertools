import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { sendEmail } from '../_shared/emailit.ts'

/**
 * Dagoverzicht — elke dag om 17.00 uur één mail aan de beheerder met de nieuwe
 * aanmeldingen, de gegeven feedback, de nieuwe ideeën en wie zich vanuit
 * Meestertools op de wachtlijst van 10minutendidactiek zette.
 *
 * Wordt alleen door de database aangeroepen (public.dagoverzicht_tick, via
 * pg_net), met het gedeelde geheim uit public.opruim_geheim. Daarom staat
 * verify_jwt uit.
 *
 * De periode loopt vanaf het vorige overzicht, zodat een aanmelding om 17.05 uur
 * gewoon in het overzicht van morgen staat. De dag wordt eerst geclaimd in
 * public.dagoverzicht_verzonden (dubbele aanroep = geen dubbele mail); lukt het
 * mailen niet, dan gaat de claim terug.
 *
 * Met { proef: true } komt er een mail over de afgelopen 24 uur, zonder claim.
 */

const NOTIFY_TO = Deno.env.get('DAGOVERZICHT_TO') || 'koen.kerkvliet@designpixels.nl'

const IDEE_LABEL: Record<string, string> = {
  'idee': 'Idee',
  'verbetering': 'Verbetering',
  'bug': 'Foutmelding',
  'nieuwe-tool': 'Nieuwe tool',
}

interface Aanmelding {
  naam: string | null
  email: string | null
  school: string | null
  plaats: string | null
  bevestigd: boolean
  nieuwsbrief: boolean
  aangemeld: string
}

interface Feedback {
  naam: string | null
  email: string | null
  rating: number
  comment: string | null
  nieuw: boolean
  gegeven: string
}

interface Idee {
  titel: string
  categorie: string
  naam: string | null
  gegeven: string
}

interface Wachter {
  naam: string | null
  email: string | null
  aangemeld: string
}

interface Overzicht {
  aanmeldingen: Aanmelding[]
  feedback: Feedback[]
  ideeen: Idee[]
  wachtlijst: Wachter[]
  wachtlijst_totaal: number
  totaal_accounts: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }
  if (req.method !== 'POST') {
    return json({ ok: false, error: 'Alleen POST.' }, 405)
  }

  try {
    const body = await req.json().catch(() => ({}))
    const geheim = String(body?.geheim || '')
    const proef = body?.proef === true

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: bekend } = await admin.from('opruim_geheim').select('geheim').maybeSingle()
    if (!geheim || !bekend || !gelijk(geheim, bekend.geheim)) {
      return json({ ok: false, error: 'Niet toegestaan.' }, 401)
    }

    const nu = new Date()
    const vandaag = new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Amsterdam' }).format(nu)
    let sinds = new Date(nu.getTime() - 24 * 3600 * 1000)

    if (!proef) {
      const { data: vorige } = await admin
        .from('dagoverzicht_verzonden')
        .select('verzonden_op')
        .order('verzonden_op', { ascending: false })
        .limit(1)
        .maybeSingle()
      // Na een paar dagen zonder overzicht (storing) niet eindeloos terugkijken.
      if (vorige) {
        const t = new Date(vorige.verzonden_op)
        if (nu.getTime() - t.getTime() < 7 * 24 * 3600 * 1000) sinds = t
      }

      const { error: claimFout } = await admin
        .from('dagoverzicht_verzonden')
        .insert({ dag: vandaag, verzonden_op: nu.toISOString() })
      if (claimFout) {
        if (claimFout.code === '23505') return json({ ok: true, sent: false, reden: 'vandaag al verstuurd' })
        throw claimFout
      }
    }

    try {
      const { data, error } = await admin.rpc('_dagoverzicht', { p_sinds: sinds.toISOString() })
      if (error) throw error
      const o = data as Overzicht

      await sendEmail({
        to: NOTIFY_TO,
        subject: onderwerp(o, proef),
        html: mailHtml(o, sinds, proef),
        text: mailText(o, sinds, proef),
      })

      return json({
        ok: true,
        sent: true,
        aanmeldingen: o.aanmeldingen.length,
        feedback: o.feedback.length,
        ideeen: o.ideeen.length,
        wachtlijst: o.wachtlijst.length,
      })
    } catch (err) {
      if (!proef) await admin.from('dagoverzicht_verzonden').delete().eq('dag', vandaag)
      throw err
    }
  } catch (err) {
    console.error('dagoverzicht error:', err)
    return json({ ok: false, error: (err as Error).message }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// Vergelijken zonder te lekken hoe ver twee geheimen overeenkomen.
function gelijk(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let verschil = 0
  for (let i = 0; i < a.length; i++) verschil |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return verschil === 0
}

const meervoud = (n: number, een: string, meer: string) => `${n} ${n === 1 ? een : meer}`

function onderwerp(o: Overzicht, proef: boolean): string {
  const delen: string[] = []
  delen.push(o.aanmeldingen.length
    ? meervoud(o.aanmeldingen.length, 'nieuwe gebruiker', 'nieuwe gebruikers')
    : 'geen nieuwe gebruikers')
  if (o.feedback.length) delen.push(meervoud(o.feedback.length, 'beoordeling', 'beoordelingen'))
  if (o.ideeen.length) delen.push(meervoud(o.ideeen.length, 'idee', 'ideeën'))
  if (o.wachtlijst.length) delen.push(`${o.wachtlijst.length} op de 10MD-wachtlijst`)
  return `${proef ? '[Proef] ' : ''}Dagoverzicht Meestertools: ${delen.join(', ')}`
}

const tijd = (iso: string) =>
  new Intl.DateTimeFormat('nl-NL', { timeZone: 'Europe/Amsterdam', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))

const datumTijd = (d: Date) =>
  new Intl.DateTimeFormat('nl-NL', {
    timeZone: 'Europe/Amsterdam', weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit',
  }).format(d)

const sterren = (n: number) => '★'.repeat(n) + '☆'.repeat(5 - n)

const schoolTekst = (a: Aanmelding) =>
  a.school ? (a.plaats ? `${a.school} (${a.plaats})` : a.school) : 'nog geen school gekozen'

function mailText(o: Overzicht, sinds: Date, proef: boolean): string {
  const lines = [
    `${proef ? '[Proef] ' : ''}Dagoverzicht Meestertools`,
    `Sinds ${datumTijd(sinds)}`,
    '',
    `NIEUWE GEBRUIKERS (${o.aanmeldingen.length})`,
  ]
  if (!o.aanmeldingen.length) lines.push('Geen nieuwe aanmeldingen.')
  for (const a of o.aanmeldingen) {
    lines.push(`- ${a.naam || '(geen naam)'} <${a.email || '?'}>, ${tijd(a.aangemeld)}`,
      `  ${schoolTekst(a)}; ${a.bevestigd ? 'e-mail bevestigd' : 'e-mail nog niet bevestigd'}${a.nieuwsbrief ? '; nieuwsbrief: ja' : ''}`)
  }
  lines.push(`Totaal nu: ${o.totaal_accounts} accounts.`, '', `FEEDBACK (${o.feedback.length})`)
  if (!o.feedback.length) lines.push('Vandaag geen feedback gegeven.')
  for (const f of o.feedback) {
    lines.push(`- ${sterren(f.rating)} (${f.rating}/5) van ${f.naam || f.email || 'onbekend'}${f.nieuw ? '' : ' (aangepast)'}`)
    if (f.comment) lines.push(`  "${f.comment}"`)
  }
  if (o.ideeen.length) {
    lines.push('', `IDEEËNBUS (${o.ideeen.length})`)
    for (const i of o.ideeen) lines.push(`- ${IDEE_LABEL[i.categorie] || 'Idee'}: ${i.titel}${i.naam ? ` (${i.naam})` : ''}`)
  }
  if (o.wachtlijst.length) {
    lines.push('', `WACHTLIJST 10MINUTENDIDACTIEK (${o.wachtlijst.length})`)
    for (const w of o.wachtlijst) lines.push(`- ${w.naam || '(geen naam)'} <${w.email || '?'}>, ${tijd(w.aangemeld)}`)
    lines.push(`Totaal via Meestertools: ${o.wachtlijst_totaal}.`)
  }
  lines.push('', 'Alles bekijken: https://meestertools.nl/beheer', '', '--', '(c) Meestertools | meestertools.nl')
  return lines.join('\n')
}

function mailHtml(o: Overzicht, sinds: Date, proef: boolean): string {
  const PRIMARY = '#6C63FF'
  const TEXT_DARK = '#2D3436'
  const TEXT_MUTED = '#636E72'
  const BG = '#F5F5F7'
  const STER = '#F5A623'

  const esc = (s: string) =>
    String(s || '').replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string
    ))

  const kop = (titel: string, n: number) => `
        <h2 style="margin:24px 0 4px;font-size:16px;color:${TEXT_DARK};">${titel} <span style="color:${TEXT_MUTED};font-weight:400;">(${n})</span></h2>`

  const leeg = (tekst: string) => `
        <p style="margin:8px 0 0;color:${TEXT_MUTED};font-size:14px;">${tekst}</p>`

  const label = (tekst: string, kleur: string, achtergrond: string) =>
    `<span style="display:inline-block;margin:4px 6px 0 0;padding:2px 8px;border-radius:999px;background:${achtergrond};color:${kleur};font-size:12px;">${tekst}</span>`

  const aanmelding = (a: Aanmelding) => `
        <div style="border-top:1px solid #EEEEF4;padding:12px 0;">
          <div style="font-size:15px;color:${TEXT_DARK};font-weight:600;">${esc(a.naam || '(geen naam)')}
            <span style="float:right;color:${TEXT_MUTED};font-weight:400;font-size:13px;">${tijd(a.aangemeld)}</span></div>
          <div style="font-size:14px;"><a href="mailto:${esc(a.email || '')}" style="color:${PRIMARY};text-decoration:none;">${esc(a.email || '')}</a></div>
          <div style="font-size:13px;color:${TEXT_MUTED};margin-top:2px;">${esc(schoolTekst(a))}</div>
          <div>${a.bevestigd ? label('e-mail bevestigd', '#1E7E4F', '#E3F6EC') : label('nog niet bevestigd', '#9A6700', '#FFF4D6')}${a.nieuwsbrief ? label('nieuwsbrief', PRIMARY, '#EEEDFF') : ''}</div>
        </div>`

  const feedback = (f: Feedback) => `
        <div style="border-top:1px solid #EEEEF4;padding:12px 0;">
          <div style="font-size:18px;color:${STER};letter-spacing:2px;">${sterren(f.rating)}
            <span style="font-size:13px;color:${TEXT_MUTED};letter-spacing:0;">${f.rating}/5${f.nieuw ? '' : ' &middot; aangepast'}</span></div>
          <div style="font-size:13px;color:${TEXT_MUTED};margin-top:2px;">${esc(f.naam || f.email || 'onbekend')}${f.naam && f.email ? ` &middot; ${esc(f.email)}` : ''} &middot; ${tijd(f.gegeven)}</div>
          ${f.comment ? `<div style="margin-top:8px;padding:10px 12px;background:#FAFAFC;border-left:3px solid ${PRIMARY};border-radius:6px;color:${TEXT_DARK};font-size:14px;line-height:1.6;white-space:pre-wrap;">${esc(f.comment)}</div>` : ''}
        </div>`

  const wachter = (w: Wachter) => `
        <div style="border-top:1px solid #EEEEF4;padding:10px 0;font-size:14px;color:${TEXT_DARK};">
          ${esc(w.naam || '(geen naam)')} <span style="color:${TEXT_MUTED};">&middot; ${esc(w.email || '')} &middot; ${tijd(w.aangemeld)}</span>
        </div>`

  const idee = (i: Idee) => `
        <div style="border-top:1px solid #EEEEF4;padding:10px 0;font-size:14px;color:${TEXT_DARK};">
          <span style="color:${TEXT_MUTED};">${esc(IDEE_LABEL[i.categorie] || 'Idee')}:</span> ${esc(i.titel)}${i.naam ? ` <span style="color:${TEXT_MUTED};">(${esc(i.naam)})</span>` : ''}
        </div>`

  return `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px 12px;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.06);">
    <tr>
      <td style="background:${PRIMARY};padding:20px 28px;color:#ffffff;">
        <div style="font-size:16px;font-weight:700;">&#128202; ${proef ? '[Proef] ' : ''}Dagoverzicht Meestertools</div>
        <div style="font-size:13px;opacity:0.85;margin-top:4px;">Sinds ${esc(datumTijd(sinds))}</div>
      </td>
    </tr>
    <tr>
      <td style="padding:4px 28px 28px;">
        ${kop('Nieuwe gebruikers', o.aanmeldingen.length)}
        ${o.aanmeldingen.length ? o.aanmeldingen.map(aanmelding).join('') : leeg('Geen nieuwe aanmeldingen.')}
        <p style="margin:8px 0 0;color:${TEXT_MUTED};font-size:13px;">Totaal nu: ${o.totaal_accounts} accounts.</p>
        ${kop('Feedback', o.feedback.length)}
        ${o.feedback.length ? o.feedback.map(feedback).join('') : leeg('Vandaag geen feedback gegeven.')}
        ${o.ideeen.length ? kop('Ideeënbus', o.ideeen.length) + o.ideeen.map(idee).join('') : ''}
        ${o.wachtlijst.length ? kop('Wachtlijst 10minutendidactiek', o.wachtlijst.length) + o.wachtlijst.map(wachter).join('')
          + `<p style="margin:8px 0 0;color:${TEXT_MUTED};font-size:13px;">Totaal via Meestertools: ${o.wachtlijst_totaal}.</p>` : ''}
        <p style="margin:28px 0 0;">
          <a href="https://meestertools.nl/beheer" style="display:inline-block;background:${PRIMARY};color:#ffffff;text-decoration:none;padding:11px 20px;border-radius:10px;font-size:14px;font-weight:700;">Naar Beheer</a>
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 28px;background:#FAFAFC;color:${TEXT_MUTED};font-size:12px;">
        Elke dag om 17.00 uur. Alleen voor de beheerder van Meestertools.
      </td>
    </tr>
  </table>
</body>
</html>`
}
