import { serve } from 'https://deno.land/std@0.224.0/http/server.ts'
import { corsHeaders } from '../_shared/cors.ts'
import { sendEmail } from '../_shared/emailit.ts'

// Recipient — fallback naar designpixels adres als secret niet gezet is.
const NOTIFY_TO = Deno.env.get('KEEPALIVE_NOTIFY_TO') || 'koen.kerkvliet@designpixels.nl'

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const payload = await req.json()
    const inserted = Number(payload?.inserted ?? 0)
    const deleted = Number(payload?.deleted ?? 0)
    const total = Number(payload?.total ?? 0)
    const timestamp = String(payload?.timestamp ?? new Date().toISOString())

    await sendEmail({
      to: NOTIFY_TO,
      subject: 'Meestertools keepalive - dagelijkse run',
      html: keepaliveHtml({ inserted, deleted, total, timestamp }),
      text: keepaliveText({ inserted, deleted, total, timestamp }),
    })

    return json({ success: true, sent_to: NOTIFY_TO })
  } catch (err) {
    console.error('keepalive notification error:', err)
    return json({ success: false, error: (err as Error).message }, 500)
  }
})

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

interface Stats {
  inserted: number
  deleted: number
  total: number
  timestamp: string
}

function keepaliveText({ inserted, deleted, total, timestamp }: Stats): string {
  return `Meestertools keepalive - dagelijkse run

Tijdstip:    ${timestamp}
Toegevoegd:  ${inserted} records
Verwijderd:  ${deleted} records (ouder dan 30 dagen)
Totaal nu:   ${total} records

Het Supabase project is actief gehouden door deze automatische write.
De cleanup zorgt dat de tabel niet onnodig vol loopt.

--
(c) Meestertools | meestertools.nl
Deze mail is geautomatiseerd. Beheer de schedule in Supabase Dashboard - Database - Cron Jobs.
`
}

function keepaliveHtml({ inserted, deleted, total, timestamp }: Stats): string {
  const PRIMARY = '#6C63FF'
  const SECONDARY = '#FF6B6B'
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
<title>Keepalive run</title>
</head>
<body style="margin:0;padding:0;background:${BG};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">

<div style="display:none;max-height:0;overflow:hidden;font-size:1px;line-height:1px;color:${BG};opacity:0;">Meestertools keepalive: ${inserted} records toegevoegd, ${deleted} opgeruimd, ${total} totaal.</div>

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${BG};">
  <tr>
    <td align="center" style="padding:24px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#ffffff;border:1px solid ${BORDER};">
        <tr>
          <td align="center" bgcolor="${PRIMARY}" style="background:${PRIMARY};padding:28px 24px;">
            <div style="font-size:20px;font-weight:700;letter-spacing:-0.2px;color:#ffffff;">Meestertools</div>
            <div style="font-size:13px;color:#ffffff;opacity:0.85;margin-top:4px;">Keepalive notificatie</div>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 32px 24px 32px;color:${TEXT_DARK};font-size:16px;line-height:1.6;">
            <h2 style="margin:0 0 16px 0;font-size:18px;font-weight:700;">Dagelijkse keepalive run voltooid</h2>
            <p style="margin:0 0 20px 0;">Het Supabase-project is actief gehouden door een automatische write naar de <code style="background:${BG};padding:2px 6px;border-radius:3px;font-size:14px;">keepalive_log</code> tabel.</p>

            <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:16px 0;">
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid ${BORDER};color:${TEXT_MUTED};font-size:14px;">Tijdstip</td>
                <td style="padding:10px 0;border-bottom:1px solid ${BORDER};text-align:right;font-weight:600;font-size:14px;">${timestamp}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid ${BORDER};color:${TEXT_MUTED};font-size:14px;">Toegevoegd</td>
                <td style="padding:10px 0;border-bottom:1px solid ${BORDER};text-align:right;font-weight:600;color:${PRIMARY};font-size:14px;">+${inserted}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;border-bottom:1px solid ${BORDER};color:${TEXT_MUTED};font-size:14px;">Opgeruimd (30+ dagen)</td>
                <td style="padding:10px 0;border-bottom:1px solid ${BORDER};text-align:right;font-weight:600;color:${SECONDARY};font-size:14px;">-${deleted}</td>
              </tr>
              <tr>
                <td style="padding:10px 0;color:${TEXT_MUTED};font-size:14px;">Totaal records nu</td>
                <td style="padding:10px 0;text-align:right;font-weight:700;font-size:16px;">${total}</td>
              </tr>
            </table>

            <p style="margin:24px 0 0 0;font-size:13px;color:${TEXT_MUTED};">Beheer de schedule in Supabase Dashboard - Database - Cron Jobs.</p>
          </td>
        </tr>
        <tr>
          <td bgcolor="${FOOTER_BG}" style="background:${FOOTER_BG};padding:16px 32px;color:${TEXT_MUTED};font-size:12px;text-align:center;border-top:1px solid ${BORDER};">
            &copy; ${YEAR} Meestertools &middot; meestertools.nl
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>

</body>
</html>`
}
