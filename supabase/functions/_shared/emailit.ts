const EMAILIT_API_KEY = Deno.env.get('EMAILIT_API_KEY')!
const EMAILIT_FROM = Deno.env.get('EMAILIT_FROM') || 'Meestertools <noreply@meestertools.nl>'

export interface EmailitPayload {
  to: string
  subject: string
  html: string
  text?: string
  from?: string
}

export async function sendEmail(payload: EmailitPayload): Promise<void> {
  const response = await fetch('https://api.emailit.com/v2/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${EMAILIT_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: payload.from || EMAILIT_FROM,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text || stripHtml(payload.html),
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`EmailIt API error: ${response.status} ${errorText}`)
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}
