import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'
import { sendEmail } from '../_shared/emailit.ts'

/**
 * Idee-melding — mailtje zodra er iets in de ideeënbus valt.
 *
 * De browser stuurt alleen een id mee, geen inhoud. De functie haalt het idee
 * zelf op met de service-role key, zodat niemand via deze weg een zelfbedachte
 * tekst naar de beheerdersmailbox kan sturen.
 *
 * Twee remmen tegen dubbele of ongewenste mail:
 *  - `notified_at` wordt gezet zodra er gemaild is; een tweede aanroep voor
 *    hetzelfde idee doet niets meer.
 *  - Het idee moet van de aanroeper zelf zijn. Een ander idee opvragen levert
 *    niks op, ook niet als je het id kent.
 *
 * verify_jwt staat aan, dus alleen ingelogde gebruikers komen hier binnen.
 */

const NOTIFY_TO = Deno.env.get('IDEEENBUS_NOTIFY_TO') || 'info@meestertools.nl'

const KIND_LABEL: Record<string, string> = {
  'idee': 'Idee',
  'verbetering': 'Verbetering',
  'bug': 'Foutmelding',
  'nieuwe-tool': 'Nieuwe tool',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const body = await req.json().catch(() => ({}))
    const ideaId = String(body?.id || '')
    if (!ideaId) return json({ ok: false, error: 'Geen id opgegeven.' }, 400)

    // Wie klopt er aan? De JWT is al gecontroleerd door de runtime; hier halen
    // we alleen de gebruiker eruit om te kijken of het idee van hem is.
    const authHeader = req.headers.get('Authorization') || ''
    const jwt = authHeader.replace(/^Bearer\s+/i, '')
    if (!jwt) return json({ ok: false, error: 'Niet ingelogd.' }, 401)

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    )

    const { data: userData } = await admin.auth.getUser(jwt)
    const user = userData?.user
    if (!user) return json({ ok: false, error: 'Niet ingelogd.' }, 401)

    const { data: idea } = await admin
      .from('ideas')
      .select('id, user_id, category, tool_id, title, body, page_url, notified_at, created_at')
      .eq('id', ideaId)
      .maybeSingle()

    if (!idea || idea.user_id !== user.id) {
      // Bewust hetzelfde antwoord als bij een al gemeld idee: geen informatie
      // weggeven over of een id bestaat.
      return json({ ok: true, sent: false })
    }
    if (idea.notified_at) {
      return json({ ok: true, sent: false })
    }

    const { data: profile } = await admin
      .from('profiles')
      .select('full_name, email')
      .eq('id', user.id)
      .maybeSingle()

    const from = profile?.full_name || profile?.email || user.email || 'Onbekend'
    const replyTo = profile?.email || user.email || ''

    const info = {
      kind: KIND_LABEL[idea.category] || 'Idee',
      from,
      email: replyTo,
      tool: idea.tool_id || '',
      page: idea.page_url || '',
      title: idea.title as string,
      body: idea.body as string,
    }

    await sendEmail({
      to: NOTIFY_TO,
      // De titel in het onderwerp: dan zie je in de inbox al waar het over gaat.
      subject: `Ideeënbus: ${idea.title}`,
      html: ideaHtml(info),
      text: ideaText(info),
      // Antwoorden gaat rechtstreeks naar de leerkracht.
      reply_to: replyTo || undefined,
    })

    await admin
      .from('ideas')
      .update({ notified_at: new Date().toISOString() })
      .eq('id', idea.id)

    return json({ ok: true, sent: true })
  } catch (err) {
    console.error('idee-melding error:', err)
    return json({ ok: false, error: (err as Error).message }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

interface IdeaInfo {
  kind: string
  from: string
  email: string
  tool: string
  page: string
  title: string
  body: string
}

function ideaText(i: IdeaInfo): string {
  const lines = [
    `Nieuw in de ideeënbus: ${i.kind}`,
    '',
    i.title,
    '',
    i.body,
    '',
    `Van:   ${i.from}${i.email ? ` (${i.email})` : ''}`,
  ]
  if (i.tool) lines.push(`Tool:  ${i.tool}`)
  if (i.page) lines.push(`Vanaf: ${i.page}`)
  lines.push('', 'Behandelen kan op https://meestertools.nl/beheer (tab Ideeënbus).', '',
    '--', '(c) Meestertools | meestertools.nl')
  return lines.join('\n')
}

function ideaHtml(i: IdeaInfo): string {
  const PRIMARY = '#6C63FF'
  const TEXT_DARK = '#2D3436'
  const TEXT_MUTED = '#636E72'
  const BG = '#F5F5F7'

  const esc = (s: string) =>
    String(s || '').replace(/[&<>"']/g, (c) => (
      { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string
    ))

  const row = (label: string, value: string) => value
    ? `<tr>
         <td style="padding:4px 12px 4px 0;color:${TEXT_MUTED};font-size:13px;white-space:nowrap;">${esc(label)}</td>
         <td style="padding:4px 0;color:${TEXT_DARK};font-size:13px;">${esc(value)}</td>
       </tr>`
    : ''

  return `<!DOCTYPE html>
<html lang="nl">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px 12px;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" cellpadding="0" cellspacing="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 2px 10px rgba(0,0,0,0.06);">
    <tr>
      <td style="background:${PRIMARY};padding:20px 28px;color:#ffffff;font-size:16px;font-weight:700;">
        &#128161; Nieuw in de idee&euml;nbus
      </td>
    </tr>
    <tr>
      <td style="padding:28px;">
        <p style="margin:0 0 6px;color:${TEXT_MUTED};font-size:13px;">${esc(i.kind)}</p>
        <h1 style="margin:0 0 16px;color:${TEXT_DARK};font-size:19px;line-height:1.4;">${esc(i.title)}</h1>
        <div style="color:${TEXT_DARK};font-size:14px;line-height:1.65;white-space:pre-wrap;">${esc(i.body)}</div>

        <table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:22px;border-top:1px solid #EEEEF4;padding-top:14px;width:100%;">
          ${row('Van', i.from + (i.email ? ` (${i.email})` : ''))}
          ${row('Tool', i.tool)}
          ${row('Vanaf', i.page)}
        </table>

        <p style="margin:24px 0 0;">
          <a href="https://meestertools.nl/beheer" style="display:inline-block;background:${PRIMARY};color:#ffffff;text-decoration:none;padding:11px 20px;border-radius:10px;font-size:14px;font-weight:700;">Behandelen in Beheer</a>
        </p>
      </td>
    </tr>
    <tr>
      <td style="padding:16px 28px;background:#FAFAFC;color:${TEXT_MUTED};font-size:12px;">
        Je kunt rechtstreeks op deze mail antwoorden &mdash; dat gaat naar de inzender.
      </td>
    </tr>
  </table>
</body>
</html>`
}
