# Twin Beans Farm — Ayurvedic Dosha Quiz

A lightweight bilingual Prakruti and Vikruti questionnaire deployed as a static Netlify site. The quiz has 31 questions across three workbook-defined sections: 15 physical, 9 functional, and 7 psychological questions. It preserves answers in local storage, while Netlify functions provide read-only result-link sharing.

Menses is optional and supports a neutral, non-scoring “No menstruation” response. The bilingual intake form keeps entered control values while its labels change language, and result printing produces a compact full profile containing scores, rankings, and selected answers.

No build step is required. Serve the repository root with any static web server.

```sh
python3 -m http.server 8000
```

## Email delivery

The `sendProfileEmail` Netlify function sends generated PDF profiles through Resend. Configure `RESEND_API_KEY` and `RESEND_FROM_EMAIL` in Netlify; the sender must be a verified Resend sender. The destination is fixed server-side to `twinbeansfarm@gmail.com`.
