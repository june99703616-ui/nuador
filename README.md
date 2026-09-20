# Nuador — Nicotine-Free Shisha Molasses (Website)

Static company site for **Nuador**, a French maison crafting nicotine-free,
tobacco-free shisha molasses. English version live; Japanese (`/ja`) planned.

## Structure

```
├── index.html            # EN home
├── catalog.html          # EN flavour catalog
├── css/style.css         # shared "Luxury Dark" theme
├── js/main.js            # nav, catalog filter, contact form
├── functions/api/contact.js   # Pages Function: contact form → email
├── ja/                   # (planned) Japanese version, reuses css/ and js/
└── .gitignore
```

## Local preview

- Quick look: open `index.html` in a browser.
- With full Pages Functions support (to test the contact form locally):

  ```bash
  npx wrangler pages dev .
  ```

## Deployment — Cloudflare Pages

1. Push this repo to GitHub.
2. Cloudflare Pages → **Create project** → connect the GitHub repo.
3. Build settings:
   - **Build command:** *(leave empty)*
   - **Output directory:** `/`
4. Add environment variables (see below).
5. Deploy. Every push to `main` auto-deploys; pull requests get preview URLs.

## Contact form

The form posts to `/api/contact` (`functions/api/contact.js`), which forwards
the enquiry by email via [Resend](https://resend.com).

Environment variables — set in **Cloudflare Pages → Settings → Environment variables**:

| Variable        | Purpose                                    | Example                              |
| --------------- | ------------------------------------------ | ------------------------------------ |
| `RESEND_API_KEY`| Resend API key                             | `re_xxxxxxxx`                        |
| `TO_EMAIL`      | Where enquiries are delivered              | `info@nuador.co`                   |
| `FROM_EMAIL`    | Verified sender (must be allowed by Resend)| `Nuador <onboarding@resend.dev>`     |

Resend notes:
- For testing, the default `onboarding@resend.dev` sender works but only
  delivers to your own Resend account email.
- For production, verify your sending domain (e.g. `nuador.com`) and set
  `FROM_EMAIL` to e.g. `Nuador <info@nuador.co>`.

> Never commit the API key — keep it in Cloudflare's environment variables
> (or `.dev.vars`, which is git-ignored, for local `wrangler pages dev`).

## Language versions

- English: root (`/index.html`, `/catalog.html`).
- Japanese (planned): `/ja/` — add later, sharing the same `css/` and `js/`.
