# Meestertools

Het digitale platform voor de basisschool. Interactieve tools voor digibord, klasprestatie, lesmateriaal en sociaal-emotionele ontwikkeling.

🌐 **Live**: https://meestertools.nl

## Stack

- **Frontend**: Statische HTML / CSS / Vanilla JS — geen build-tool
- **Hosting**: GitHub Pages (custom domain via `CNAME`)
- **Backend**: Supabase (Auth + Postgres + Edge Functions)
- **Email**: emailit.com via Supabase Edge Functions

## Structuur

```
.
├── index.html                          # Inloggen
├── registreer.html                     # Account aanmaken
├── dashboard.html                      # Tools-overzicht (na inloggen)
├── beheer.html                         # Super-admin paneel
├── changelog.html                      # Release notes
├── wachtwoord-vergeten.html            # Reset email aanvragen
├── wachtwoord-resetten.html            # Nieuw wachtwoord instellen
├── 404.html                            # Niet-gevonden pagina (GitHub Pages)
├── favicon.svg                         # Site favicon
├── CNAME                               # GitHub Pages custom domain
├── css/                                # Stylesheets
├── js/                                 # Vanilla JS (per tool een bestand)
├── digibordtools.html                  # Digibordtools overview
├── educatieve-games.html               # Games overview
├── klasseprestatie.html                # Klasprestatie
├── lesmateriaal.html                   # Lesmateriaal overview
├── ontspanning.html                    # Ontspanningstools
├── seo.html                            # SEO overview
├── digibord/                           # Digibordtools (timer, draairad, dobbelstenen, ...)
├── educatieve-games/                   # 24 game e.d.
├── lesmateriaal/                       # Werkbladen, vraag van de dag, woordenflitsen
├── seo/                                # Check-in, gedragspatroon
├── supabase/
│   └── functions/
│       ├── _shared/                    # Herbruikbare CORS + emailit helpers
│       └── send-password-reset-email/  # Edge function voor reset-mail
├── supabase-setup.sql                  # Initiele database schema + RLS
└── supabase-rls-fix.sql                # Latere RLS aanpassingen
```

## Lokaal draaien

Statisch — open `index.html` rechtstreeks of via een simpele static server:

```bash
# Python (vrijwel overal beschikbaar)
python -m http.server 3000

# of Node
npx serve .
```

Open dan http://localhost:3000.

> **Let op**: voor Supabase Auth moet je redirect URLs toevoegen aan
> Supabase Dashboard → Auth → URL Configuration → Redirect URLs:
> `http://localhost:*/wachtwoord-resetten` (al ingesteld).

## Deployment

**Automatisch via GitHub Pages.** Push naar `main` = live op meestertools.nl binnen ~30 sec.

```bash
git add .
git commit -m "Beschrijving van de wijziging"
git push origin main
```

## Edge Functions

Edge functions deployen via Supabase CLI of de Supabase Dashboard:

```bash
supabase functions deploy send-password-reset-email --no-verify-jwt
```

Vereiste secrets (in Supabase Dashboard → Edge Functions → Secrets):

| Naam | Voorbeeld |
|---|---|
| `EMAILIT_API_KEY` | `secret_xxx` |
| `EMAILIT_FROM` | `Meestertools <noreply@meestertools.nl>` |
| `EMAILIT_REPLY_TO` | `support@meestertools.nl` (optioneel) |

## Versie

Zie [changelog.html](./changelog.html) of in de footer van elke pagina.

---

© Meestertools · Design by [Design Pixels](https://designpixels.nl)
