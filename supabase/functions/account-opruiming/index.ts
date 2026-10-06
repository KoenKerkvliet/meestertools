import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { sendEmail } from '../_shared/emailit.ts'

/**
 * Account-opruiming — verstuurt de twee mails uit het opruimtraject:
 *
 *  - "zetje":  eenmalig een vriendelijke mail naar iemand die nog geen klas heeft.
 *  - "spook":  de waarschuwing dat een account dat nooit gebruikt is over 30 dagen
 *              wordt opgeruimd. Inloggen is genoeg om het te behouden.
 *
 * Wie er aan de beurt is bepaalt de database (public._opruim_kandidaten), en
 * die houdt ook rekening met de zomerstop. Deze functie voert alleen uit.
 *
 * Aangeroepen door pg_cron via pg_net (public.opruim_mail_tick), dus zonder JWT.
 * In plaats daarvan stuurt de database een gedeeld geheim mee dat in
 * public.opruim_geheim staat; dat wordt hier met de service role vergeleken.
 *
 * Elke mail wordt eerst "geclaimd" door een rij in opruim_mails (primary key
 * user_id + soort). Zo kan een tweede aanroep of een herhaalde cron-run nooit
 * dezelfde persoon twee keer mailen. Mislukt het versturen, dan gaat de claim
 * weer weg en komt de gebruiker de volgende dag opnieuw aan de beurt.
 *
 * Verder een rem: hoogstens MAX_PER_RUN mails per aanroep.
 */

const SITE = 'https://meestertools.nl'
const CONTACT = 'info@meestertools.nl'
const MAX_PER_RUN = 20

interface Kandidaat {
  user_id: string
  email: string | null
  naam: string | null
  aangemeld: string
  actie: string
  due: boolean
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

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: bekend } = await admin.from('opruim_geheim').select('geheim').maybeSingle()
    if (!geheim || !bekend || !gelijk(geheim, bekend.geheim)) {
      return json({ ok: false, error: 'Niet toegestaan.' }, 401)
    }

    // De database kijkt al naar de modus; hier nogmaals, want dit is de plek
    // waar er daadwerkelijk iets de deur uitgaat.
    const { data: inst } = await admin.from('opruim_instellingen').select('modus').maybeSingle()
    if (!inst || (inst.modus !== 'mails' && inst.modus !== 'volledig')) {
      return json({ ok: true, sent: 0, reden: 'modus staat op lijst' })
    }

    const { data: kandidaten, error } = await admin.rpc('_opruim_kandidaten')
    if (error) throw error

    const todo = ((kandidaten || []) as Kandidaat[])
      .filter((k) => k.due && (k.actie === 'mail_zetje' || k.actie === 'mail_spook') && k.email)
      .slice(0, MAX_PER_RUN)

    let sent = 0
    let failed = 0

    for (const k of todo) {
      const soort = k.actie === 'mail_zetje' ? 'zetje' : 'spook'

      // Claimen. Bestaat de rij al, dan was een andere run ons voor.
      const claim = await admin.from('opruim_mails').insert({ user_id: k.user_id, soort })
      if (claim.error) {
        if (claim.error.code !== '23505') console.error('claim mislukt:', claim.error)
        continue
      }

      try {
        const mail = soort === 'zetje' ? zetjeMail(k.naam) : spookMail(k.naam, k.aangemeld)
        await sendEmail({ to: k.email!, reply_to: CONTACT, ...mail })
        sent++
      } catch (err) {
        console.error('mail versturen mislukt:', (err as Error).message)
        await admin.from('opruim_mails').delete().eq('user_id', k.user_id).eq('soort', soort)
        failed++
      }
    }

    return json({ ok: true, sent, failed })
  } catch (err) {
    console.error('account-opruiming error:', err)
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

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function datumNl(d: Date): string {
  return d.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/Amsterdam' })
}

interface Mail {
  subject: string
  html: string
  text: string
}

// ---------- De twee mails ----------

function zetjeMail(naam: string | null): Mail {
  const hoi = naam ? `Hoi ${naam},` : 'Hoi,'
  const login = `${SITE}/inloggen`

  const text = `${hoi}

Een tijdje geleden heb je een account gemaakt op Meestertools, maar je hebt nog geen klas ingesteld. Dat is vaak het moment waarop het echt handig wordt, en het kost nog geen twee minuten:

1. Log in en kies op je dashboard "Klas instellen".
2. Voer de voornamen van je leerlingen één keer in. Elke tool gebruikt ze daarna automatisch.
3. Probeer de namenkiezer op het digibord. Dat is in veel klassen de favoriet.

Log in: ${login}

Loop je ergens tegenaan, of mis je iets? Antwoord gerust op deze mail, dan kijk ik wat ik kan doen.

Groet,
Koen
Meestertools

--
Dit is een eenmalige mail. Je hoeft er niets mee.`

  const html = layout({
    titel: 'Zal ik je op weg helpen?',
    preheader: 'Je klas instellen kost nog geen twee minuten.',
    inhoud: `
      <p style="margin:0 0 16px 0;">${esc(hoi)}</p>
      <p style="margin:0 0 16px 0;">Een tijdje geleden heb je een account gemaakt op Meestertools, maar je hebt nog geen klas ingesteld. Dat is vaak het moment waarop het echt handig wordt, en het kost nog geen twee minuten:</p>
      <ol style="margin:0 0 20px 0;padding-left:22px;">
        <li style="margin-bottom:8px;">Log in en kies op je dashboard <strong>Klas instellen</strong>.</li>
        <li style="margin-bottom:8px;">Voer de voornamen van je leerlingen één keer in. Elke tool gebruikt ze daarna automatisch.</li>
        <li>Probeer de <strong>namenkiezer</strong> op het digibord. Dat is in veel klassen de favoriet.</li>
      </ol>`,
    knop: { label: 'Naar Meestertools', url: login },
    afsluiting: `
      <p style="margin:0 0 16px 0;">Loop je ergens tegenaan, of mis je iets? Antwoord gerust op deze mail, dan kijk ik wat ik kan doen.</p>
      <p style="margin:0;">Groet,<br>Koen<br><span style="color:#636E72;">Meestertools</span></p>`,
    voet: 'Dit is een eenmalige mail. Je hoeft er niets mee.',
  })

  return { subject: 'Zal ik je op weg helpen met Meestertools?', html, text }
}

function spookMail(naam: string | null, aangemeld: string): Mail {
  const hoi = naam ? `Hoi ${naam},` : 'Hoi,'
  const login = `${SITE}/inloggen`
  const aangemeldOp = datumNl(new Date(aangemeld))
  const uiterlijk = datumNl(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))

  const text = `${hoi}

Je hebt je op ${aangemeldOp} aangemeld bij Meestertools, maar sindsdien heb je geen klas of school ingesteld en ben je niet meer teruggekomen.

Om niet onnodig gegevens te bewaren, ruimen we zulke accounts na een tijd op. Dat betreft je naam, e-mailadres en instellingen. Meer staat er niet in.

Wil je je account houden? Log dan voor ${uiterlijk} één keer in: ${login}
Dan blijft alles zoals het is en hoor je hier niets meer over.

Wil je het niet houden? Dan hoef je niets te doen. Na die datum wordt je account automatisch verwijderd.

Vragen? Antwoord gerust op deze mail.

Groet,
Koen
Meestertools`

  const html = layout({
    titel: 'Je account wordt over 30 dagen opgeruimd',
    preheader: 'Log één keer in als je je account wilt houden.',
    inhoud: `
      <p style="margin:0 0 16px 0;">${esc(hoi)}</p>
      <p style="margin:0 0 16px 0;">Je hebt je op <strong>${esc(aangemeldOp)}</strong> aangemeld bij Meestertools, maar sindsdien heb je geen klas of school ingesteld en ben je niet meer teruggekomen.</p>
      <p style="margin:0 0 16px 0;">Om niet onnodig gegevens te bewaren, ruimen we zulke accounts na een tijd op. Dat betreft alleen je naam, e-mailadres en instellingen. Meer staat er niet in.</p>
      <p style="margin:0 0 20px 0;"><strong>Wil je je account houden?</strong> Log dan voor <strong>${esc(uiterlijk)}</strong> één keer in. Dan blijft alles zoals het is en hoor je hier niets meer over.</p>`,
    knop: { label: 'Inloggen', url: login },
    afsluiting: `
      <p style="margin:0 0 16px 0;color:#636E72;">Wil je het niet houden? Dan hoef je niets te doen. Na die datum wordt je account automatisch verwijderd.</p>
      <p style="margin:0 0 16px 0;">Vragen? Antwoord gerust op deze mail.</p>
      <p style="margin:0;">Groet,<br>Koen<br><span style="color:#636E72;">Meestertools</span></p>`,
    voet: '',
  })

  return { subject: 'Je Meestertools-account wordt over 30 dagen opgeruimd', html, text }
}

// ---------- Opmaak ----------

function layout(o: {
  titel: string
  preheader: string
  inhoud: string
  knop: { label: string; url: string }
  afsluiting: string
  voet: string
}): string {
  const PRIMARY = '#6C63FF'
  const TEXT_DARK = '#2D3436'
  const TEXT_MUTED = '#636E72'
  const BG = '#F5F5F7'
  const FOOTER_BG = '#FAFAFA'
  const BORDER = '#E8E8F0'
  const YEAR = new Date().getFullYear()

  return `<!DOCTYPE html>
<html lang="nl">
<head>
<meta charset="UTF-8">
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<meta name="supported-color-schemes" content="light">
<title>${esc(o.titel)}</title>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:${BG};opacity:0;">${esc(o.preheader)}</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BG};">
  <tr>
    <td align="center" style="padding:24px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border:1px solid ${BORDER};">
        <tr>
          <td align="center" bgcolor="${PRIMARY}" style="background:${PRIMARY};padding:28px 24px;">
            <div style="font-size:20px;font-weight:700;letter-spacing:-0.2px;color:#ffffff;">Meestertools</div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 32px 8px 32px;color:${TEXT_DARK};font-size:16px;line-height:1.6;">
            <h2 style="margin:0 0 20px 0;font-size:20px;font-weight:700;">${esc(o.titel)}</h2>
            ${o.inhoud}
          </td>
        </tr>
        <tr>
          <td align="center" style="padding:4px 32px 24px 32px;">
            <a href="${esc(o.knop.url)}" style="display:inline-block;background:${PRIMARY};color:#ffffff;text-decoration:none;font-weight:700;font-size:16px;padding:14px 28px;border-radius:8px;">${esc(o.knop.label)}</a>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px 32px 32px;color:${TEXT_DARK};font-size:16px;line-height:1.6;">
            ${o.afsluiting}
          </td>
        </tr>
        <tr>
          <td bgcolor="${FOOTER_BG}" style="background:${FOOTER_BG};padding:16px 32px;color:${TEXT_MUTED};font-size:12px;text-align:center;border-top:1px solid ${BORDER};">
            ${o.voet ? esc(o.voet) + '<br>' : ''}&copy; ${YEAR} Meestertools &middot; meestertools.nl
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

</body>
</html>`
}
