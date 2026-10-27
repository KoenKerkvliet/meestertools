import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { sendEmail } from '../_shared/emailit.ts'

/**
 * Tijdlijn-melding — mailtje met nieuwe voorstellen van tijdlijnbezoekers.
 *
 * Wordt alleen door de database aangeroepen (public.tijdlijn_melding_tick, via
 * pg_net), met het gedeelde geheim uit public.opruim_geheim. Daarom staat
 * verify_jwt uit. Hoe vaak er gemaild mag worden, bepaalt de database.
 *
 * Alle voorstellen die nog niet gemeld zijn gaan in één mail. Ze worden eerst
 * geclaimd (gemeld_at gezet), zodat twee aanroepen tegelijk niet dubbel mailen;
 * lukt het mailen niet, dan gaat de claim terug en probeert de volgende tick het opnieuw.
 */

// info@meestertools.nl bestaat (nog) niet als mailbox: meldingen gaan naar Koens eigen adres.
const NOTIFY_TO = Deno.env.get('TIJDLIJN_NOTIFY_TO') || Deno.env.get('IDEEENBUS_NOTIFY_TO') || 'koen.kerkvliet@designpixels.nl'

const SOORT_LABEL: Record<string, string> = {
  'fout': 'Fout',
  'aanvulling': 'Aanvulling',
  'anders': 'Iets anders',
}

interface Voorstel {
  id: string
  created_at: string
  slug: string
  onderwerp: string
  soort: string
  tekst: string
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

    const { data, error } = await admin
      .from('tijdlijn_voorstellen')
      .update({ gemeld_at: new Date().toISOString() })
      .is('gemeld_at', null)
      .select('id, created_at, slug, onderwerp, soort, tekst')
    if (error) throw error
    const lijst = ((data || []) as Voorstel[]).sort((a, b) => a.created_at.localeCompare(b.created_at))
    if (!lijst.length) return json({ ok: true, sent: 0 })

    try {
      await sendEmail({
        to: NOTIFY_TO,
        subject: lijst.length === 1
          ? `Tijdlijn: voorstel bij ${lijst[0].onderwerp}`
          : `Tijdlijn: ${lijst.length} nieuwe voorstellen`,
        html: mailHtml(lijst),
        text: mailText(lijst),
      })
    } catch (err) {
      await admin.from('tijdlijn_voorstellen').update({ gemeld_at: null }).in('id', lijst.map((v) => v.id))
      throw err
    }

    return json({ ok: true, sent: lijst.length })
  } catch (err) {
    console.error('tijdlijn-melding error:', err)
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

const link = (v: Voorstel) => `https://meestertools.nl/tijdlijn/#${encodeURIComponent(v.slug)}/lees`

function mailText(lijst: Voorstel[]): string {
  const lines = [lijst.length === 1 ? 'Nieuw voorstel op de tijdlijn' : `${lijst.length} nieuwe voorstellen op de tijdlijn`, '']
  for (const v of lijst) {
    lines.push(`${SOORT_LABEL[v.soort] || v.soort}: ${v.onderwerp}`, link(v), '', v.tekst, '', '---', '')
  }
  lines.push('Behandelen kan op https://meestertools.nl/beheer#tijdlijn (Beheer van tools, tab Tijdlijn).',
    'De inzender is anoniem; antwoorden kan niet.', '', '--', '(c) Meestertools | meestertools.nl')
  return lines.join('\n')
}

function mailHtml(lijst: Voorstel[]): string {
  const PRIMARY = '#6C63FF'
  const TEXT_DARK = '#2D3436'
  const TEXT_MUTED = '#636E72'
  const BG = '#F5F5F7'

  const esc = (s: string) =>
    String(s || '').replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string
    ))

  const blok = (v: Voorstel) => `
        <div style="border-top:1px solid #EEEEF4;padding-top:16px;margin-top:16px;">
          <p style="margin:0 0 4px;color:${TEXT_MUTED};font-size:13px;">${esc(SOORT_LABEL[v.soort] || v.soort)}</p>
          <h2 style="margin:0 0 10px;font-size:17px;line-height:1.4;"><a href="${esc(link(v))}" style="color:${TEXT_DARK};">${esc(v.onderwerp)}</a></h2>
          <div style="color:${TEXT_DARK};font-size:14px;line-height:1.65;white-space:pre-wrap;">${esc(v.tekst)}</div>
        </div>`

  return `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px 12px;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.06);">
    <tr>
      <td style="background:${PRIMARY};padding:20px 28px;color:#ffffff;font-size:16px;font-weight:700;">
        &#9203; ${lijst.length === 1 ? 'Nieuw voorstel op de tijdlijn' : `${lijst.length} nieuwe voorstellen op de tijdlijn`}
      </td>
    </tr>
    <tr>
      <td style="padding:12px 28px 28px;">
        ${lijst.map(blok).join('')}
        <p style="margin:24px 0 0;">
          <a href="https://meestertools.nl/beheer#tijdlijn" style="display:inline-block;background:${PRIMARY};color:#ffffff;text-decoration:none;padding:11px 20px;border-radius:10px;font-size:14px;font-weight:700;">Behandelen in Beheer</a>
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 28px;background:#FAFAFC;color:${TEXT_MUTED};font-size:12px;">
        De inzender is anoniem; een antwoord op deze mail komt niet bij de inzender aan.
      </td>
    </tr>
  </table>
</body>
</html>`
}
