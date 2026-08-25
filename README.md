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
├── groepsvorming.html                  # Groepsvorming overview (thema-hub)
├── digibord/                           # Digibordtools (timer, draairad, dobbelstenen, ...)
├── educatieve-games/                   # 24 game e.d.
├── lesmateriaal/                       # Werkbladen, vraag van de dag, woordenflitsen
├── groepsvorming/                      # Check-in, gedragspatroon, sociogram
├── scripts/
│   └── set-version.js                  # versie zetten + ?v= cache-busting syncen
├── supabase/
│   ├── config.toml                     # verify_jwt per edge function
│   ├── migrations/                     # schema-wijzigingen
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

**Deployen gaat automatisch.** De workflow
[deploy-functions.yml](./.github/workflows/deploy-functions.yml) deployt bij een
push naar `main` de functies die in die push zijn gewijzigd. Verandert er iets
in `_shared/` of in `config.toml`, dan gaan ze allemaal mee, want die code zit
in elke functie gebundeld.

Eenmalig instellen: repo → Settings → Secrets and variables → Actions → secret
`SUPABASE_ACCESS_TOKEN`, met een token uit
<https://supabase.com/dashboard/account/tokens>.

`supabase/config.toml` bepaalt per functie of er een JWT vereist is. Vergeet die
niet als je een nieuwe functie toevoegt: zonder regel deployt de CLI met
`verify_jwt = true`.

Handmatig kan uiteraard ook:

```bash
supabase functions deploy send-password-reset-email --project-ref chnjybpwquystuwmiger
```

Vereiste secrets (in Supabase Dashboard → Edge Functions → Secrets):

| Naam | Voorbeeld |
|---|---|
| `EMAILIT_API_KEY` | `secret_xxx` |
| `EMAILIT_FROM` | `Meestertools <noreply@meestertools.nl>` |
| `EMAILIT_REPLY_TO` | `support@meestertools.nl` (optioneel) |

## Versie

De versie staat op één plek: `const VERSION` in [js/template.js](./js/template.js).
Die versie hangt ook als `?v=` achter elke eigen css/js-verwijzing in de HTML,
zodat een nieuwe HTML nooit met oude JS gecombineerd kan worden (GitHub Pages
serveert alles met `max-age=600`).

Ophogen doe je daarom met het script, niet met de hand:

```bash
node scripts/set-version.js 1.47.0   # versie zetten én alle HTML syncen
node scripts/set-version.js          # alleen syncen, huidige versie
node scripts/set-version.js --check  # controleren (draait ook in CI)
```

De GitHub Action *Controle* laat een push falen als de `?v=` niet meer
gelijkloopt, of als een JS-bestand een syntaxfout bevat.

Zie [changelog.html](./changelog.html) of de footer van elke pagina voor wat er
per versie is veranderd.

---

© Meestertools · Design by [Design Pixels](https://designpixels.nl)
