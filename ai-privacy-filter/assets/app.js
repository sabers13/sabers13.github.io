/* AI Privacy Filter — page logic and the English/German dictionary.
   No build step: plain DOM, fetch for the two JSON files, localStorage for
   language and theme (both wrapped in try/catch). Every headline number is
   computed by assets/results-model.js from data/results.json. */
(function () {
  'use strict';

  var I18N = {
    en: {
      "meta.title": "AI Privacy Filter — Saber Sojudi",
      "meta.desc": "A filter that replaces personal data with placeholders before a customer email reaches an AI, then puts the real values back into the reply. Measured results, demo and limits.",
      "skip": "Skip to the content",
      "brand.sub": "Pseudonymise before the AI sees it",
      "nav.example": "Example", "nav.gallery": "Gallery", "nav.try": "Try it",
      "nav.how": "How it works", "nav.workflow": "Review step", "nav.results": "Results",
      "nav.technical": "Details",
      "a.light": "Light theme", "a.dark": "Dark theme", "a.github": "View the source on GitHub",
      "a.lang": "Language", "a.theme": "Theme", "a.sections": "Sections", "a.technology": "Technology", "a.footer": "Footer",

      "hero.eyebrow": "Python pipeline · German emails",
      "hero.title": "AI Privacy Filter",
      "hero.lead": "I built a Python pipeline that replaces personal data in German emails with placeholders, then restores the values in the reply.",
      "hero.github": "View on GitHub", "hero.try": "Try it",
      "hero.fine": "All examples are synthetic. No real customer emails appear on this page.",
      "hero.card.title": "Local first",
      "hero.card.s1.t": "Detect", "hero.card.s1.d": "Names, emails, phone numbers, IBANs",
      "hero.card.s2.t": "Replace", "hero.card.s2.d": "Typed placeholders, numbered per message",
      "hero.card.s3.t": "Draft", "hero.card.s3.d": "The AI writes with placeholders, not people",
      "hero.card.s4.t": "Restore", "hero.card.s4.d": "Real values go back on your machine",
      "tech.python": "Python", "tech.presidio": "Presidio", "tech.fastapi": "FastAPI", "tech.n8n": "n8n",

      "demo.eyebrow": "Worked example",
      "demo.title": "An email, end to end",
      "demo.lead": "One synthetic quote request, shown end to end. Highlighted text is personal data; the middle column is all the model receives.",
      "demo.col.original": "Original", "demo.col.original.sub": "Synthetic enquiry",
      "demo.col.ai": "What the AI sees", "demo.col.ai.sub": "Pseudonymised",
      "demo.col.final": "Final draft", "demo.col.final.sub": "Values restored",
      "demo.foot.original": "Highlighted = personal data",
      "demo.foot.ai": "[TYPE_n] = placeholder",
      "demo.foot.final": "Restored locally before sending",
      "demo.note": "The filter is built for German text; the interface is available in English and German.",

      "stats.eyebrow": "Measured results",
      "stats.title": "What it caught and missed",
      "stats.lead": "Numbers from the test runs behind this project. The datasets and the limits follow below.",
      "stats.note": "Measured once on held-out test data. No value here was tuned on the test split.",
      "kpi.ci.button": "95% CI",
      "kpi.ci.value": "95% CI {range}",
      "chart.note": "Bars show the measured value; the whiskers show the 95% Wilson confidence interval.",
      "chart.desc": "Horizontal bar chart with 95% confidence intervals. The same numbers are listed in the table below the chart.",
      "chart.legend": "Legend",
      "chart.th.group": "Group",
      "chart.th.value": "Value",
      "chart.th.count": "n / N",
      "chart.th.ci": "95% CI",
      "chart.table.caption": "{title} — numbers behind the chart",
      "chart.error": "The chart data could not be loaded.",

      "workflow.eyebrow": "The review step",
      "workflow.title": "A person approves every reply",
      "workflow.lead": "In n8n, an enquiry is pseudonymised, checked by the guard and drafted. A reviewer sees the pseudonymised text, the category, the urgency and the restored draft, then approves, edits or rejects it.",
      "workflow.caption": "Workflow canvas after one demo run: enquiry in, pseudonymise, guard, draft, review, write the result. Both branches finish green.",
      "workflow.alt": "n8n workflow canvas after a finished demo execution, with both the review and blocked branches marked successful",
      "workflow.shot.list.caption": "Executions list: the demo runs finish successfully, including the one the reviewer edited.",
      "workflow.shot.list.alt": "n8n executions list with the successful synthetic demo runs",
      "workflow.shot.form.caption": "Review form: the reviewer chose Edit and replaced the draft before submitting. The human step exists because a draft can be wrong or reuse the customer's details in the reply.",
      "workflow.shot.form.alt": "n8n review form with the edit decision selected and a corrected reply draft filled in",
      "workflow.shot.result.caption": "Result record: the edit decision and the corrected reply are what gets stored.",
      "workflow.shot.result.alt": "Result card of the edited reply record, showing the text the model saw and the final corrected reply",

      "gallery.eyebrow": "Examples",
      "gallery.title": "Synthetic enquiries",
      "gallery.lead": "Filter by category. Open a card to compare the original with what the AI saw. Labelled misses stay visible on purpose.",
      "gallery.filter": "Category", "gallery.all": "All",
      "gallery.note": "Every text is synthetic. Names, addresses, phone numbers and IBANs were generated for this demo.",
      "gallery.count": "{n} of {total} examples",
      "gallery.showOriginal": "Show original",
      "gallery.missed": "Labelled miss",
      "gallery.blocked": "Stopped before the model",
      "gallery.empty": "No examples in this category.",
      "gallery.cat.QUOTE_REQUEST": "Quote request", "gallery.cat.SUPPORT": "Support",
      "gallery.cat.JOB_APPLICATION": "Job application", "gallery.cat.PARTNERSHIP": "Partnership",
      "gallery.cat.OTHER": "Other",
      "gallery.urgency.LOW": "Low", "gallery.urgency.NORMAL": "Normal", "gallery.urgency.HIGH": "High",

      "type.PERSON": "Person", "type.ORG": "Organisation", "type.EMAIL": "Email",
      "type.PHONE": "Phone", "type.IBAN": "IBAN", "type.ADDRESS_STREET": "Street",
      "type.POSTCODE_CITY": "Postcode + city", "type.URL": "URL", "type.VAT_ID": "VAT ID",
      "type.DATE_OF_BIRTH": "Date of birth",

      "backend.claude-cli": "Claude via CLI", "backend.codex-cli": "Codex via CLI",
      "backend.byok": "Cloud model (BYOK)", "backend.ollama": "Ollama, local",
      "backend.guard-blocked": "Stopped by the guard",

      "try.eyebrow": "Try it yourself",
      "try.title": "Try the filter",
      "try.lead": "Paste a German email and replace personal data with placeholders. This simplified filter runs in your browser tab; it is not the server pipeline.",
      "try.banner": "Runs in your browser. Nothing you type leaves this page.",
      "try.label": "Your text", "try.placeholder": "Paste a customer email here…",
      "try.button": "Hide personal data", "try.sample": "Use a sample", "try.clear": "Clear",
      "try.inputNote": "Email, German phone, IBAN with checksum, postcode + city, street + number, URL, German first names and salutation cues.",
      "try.resultLabel": "What the AI would see",
      "try.empty": "The result appears here after you press the button.",
      "try.found": "{n} personal data items replaced",
      "try.none": "No personal data found by this simplified filter.",
      "try.replaced": "Replaced:",
      "try.note": "This box makes no network requests. It runs only the checks listed on the left.",

      "how.eyebrow": "How it works",
      "how.title": "The pipeline",
      "how.lead": "Personal data is replaced before the request crosses to the AI backend. The placeholder map never leaves the local process.",
      "how.s1.t": "Detect", "how.s1.d": "names, emails, IBANs",
      "how.s2.t": "Replace", "how.s2.d": "with [TYPE_n]",
      "how.s3.t": "Guard", "how.s3.d": "re-scan before sending",
      "how.s4.t": "AI draft", "how.s4.d": "on pseudonymised text",
      "how.s5.t": "Restore", "how.s5.d": "real values back",
      "how.svgTitle": "Five-step flow: detect, replace, guard, AI draft, restore",
      "how.legend.local": "On your machine", "how.legend.network": "Network call",
      "how.note": "Step 4 is the only one that talks to an AI backend. The guard re-scans the pseudonymised text and blocks the call if a mapped value is still there.",

      "res.eyebrow": "Results and limits",
      "res.title": "Results and limits",
      "res.lead": "One test split, measured once. Misses are reported as they are.",
      "res.detection.title": "Detection",
      "res.detection.lead": "A labelled span counts as caught only when every character is covered by a compatible prediction.",
      "res.detection.note": "GermEval 2014 is used only to compute detection rates; no sentences are shown.",
      "res.th.dataset": "Dataset", "res.th.recall": "Recall",
      "res.th.missed": "Missed spans", "res.th.covers": "What it covers",
      "res.germeval.name": "GermEval 2014 (test)",
      "res.germeval.desc": "{n} sentences, names and organisations only",
      "res.synthetic.name": "Synthetic test",
      "res.synthetic.desc": "{n} synthetic emails, {types} personal-data types",
      "res.misses": "Missed: {list}.",
      "res.misses.none": "No labelled span was missed.",
      "res.triage.title": "Reply drafting",
      "res.triage.lead": "Every backend answered the same enquiry set.",
      "res.triage.note": "Valid JSON counts usable answers. Category and urgency are exact matches. Values the filter had replaced that reached a backend: {leaks} in {calls} calls — this checks replacement only; values the filter never detected are covered by the rate above.",
      "res.th.backend": "Backend",
      "res.th.validJson": "Valid JSON",
      "res.th.category": "Category",
      "res.th.urgency": "Urgency",
      "res.th.latency": "Median reply",
      "res.th.calls": "Calls",
      "res.limits.title": "What this does not catch",
      "res.limits.lead": "Known limits, shown next to the numbers.",
      "res.th.limit": "Limit", "res.th.what": "What happens", "res.th.mitigation": "Mitigation",
      "res.limits.r1.l": "Names outside the list", "res.limits.r1.w": "Unusual or non-German names can stay in clear.", "res.limits.r1.m": "Salutation cues and a human check before sending.",
      "res.limits.r2.l": "Addresses without a number", "res.limits.r2.w": "A street name without a house number may not match.", "res.limits.r2.m": "Add a manual review step for address blocks.",
      "res.limits.r3.l": "Postcode and city pairs", "res.limits.r3.w": "Some pairs are not matched, and the remaining text stays in clear.", "res.limits.r3.m": "The guard stops the call when it still finds a mapped value; a reviewer checks the rest.",
      "res.limits.r4.l": "Context inference", "res.limits.r4.w": "A model can still infer sensitive facts from the situation.", "res.limits.r4.m": "Keep a human in the loop; do not treat pseudonymised text as safe to publish.",
      "res.limits.r5.l": "Scanned documents", "res.limits.r5.w": "Text inside images is not covered by this filter.", "res.limits.r5.m": "OCR and manual review before sending.",
      "res.limits.r6.l": "Legal status", "res.limits.r6.w": "Replacing data does not by itself make a processing operation lawful.", "res.limits.r6.m": "Assess purpose, legal basis and contracts separately.",
      "res.notLegal.title": "Not legal advice",
      "res.notLegal.body": "This page describes a technical filter. It is not legal advice and does not replace a review of your processing under data-protection law.",
      "res.pseudo.title": "Pseudonymisation keeps the link",
      "res.pseudo.body": "The filter replaces personal data with placeholders. The original values still exist in the local map and can be restored, so the result stays linked to the person.",
      "res.adoption.lead": "Interested in using this in your organisation?",
      "res.adoption.link": "Get in touch",

      "tech.eyebrow": "Technical details",
      "tech.title": "Implementation details",
      "tech.lead": "Architecture, detection stack, guard, backends and the tests behind the privacy claims.",
      "tech.arch.sum": "Architecture",
      "tech.arch.body": "A FastAPI service receives an enquiry, runs detection, replaces values with typed placeholders, re-scans the result, calls one AI backend, and restores the placeholders in the returned draft. n8n triggers the flow; the placeholder map stays in memory and is never written to the page data.",
      "tech.detect.sum": "Detection stack",
      "tech.detect.body": "Microsoft Presidio and spaCy handle names and organisations. Regular expressions with checksums handle emails, German phone numbers, IBANs, postcodes with city, street with number, URLs and VAT IDs. The browser demo adds a Faker de_DE first-name list and salutation cues.",
      "tech.guard.sum": "The guard",
      "tech.guard.body": "Before any AI call, a second pass compares the pseudonymised text with the values found in the original. It checks normalised originals and digit-only forms for phone numbers and IBANs. On a leak the call is blocked and the verdict names the leaked types, never the values.",
      "tech.backends.sum": "AI backends",
      "tech.backends.body": "Four backends behind one interface: Claude and Codex through their CLIs, a BYOK chat-completions endpoint, and a local Ollama model. The results table records every call of the reply-writing test.",
      "tech.test.sum": "No-network test for the demo",
      "tech.test.body": "The try-it box was checked with browser network logging: typing text and pressing the button made no requests. The claim covers that box only; the rest of this page loads its two JSON files once.",
      "tech.data.sum": "Test data and reporting",
      "tech.data.body": "All enquiries on this page are synthetic, built from hand-written templates and Faker de_DE values. GermEval 2014 is downloaded by a script, git-ignored, never shown and never sent to a model; only detection rates are published. Labelled misses are reported as they are.",
      "tech.repro.sum": "Reproducibility",
      "tech.repro.body": "The page data carries the run's version, commit, timestamp and SHA-256. A small assertion script checks that every KPI and every charted value equals the value in kpis.json and charts/*.json.",

      "credits.eyebrow": "Data and credits",
      "credits.title": "Sources and credits",
      "credits.lead": "Open tools and one research dataset, with the licence and the limit of each.",
      "credits.germeval.desc": "German Wikipedia and news text. Used only to compute detection rates; no sentences shown.",
      "credits.presidio.desc": "PII detection for names, organisations and more.",
      "credits.spacy.desc": "German NLP with the de_core_news_lg model behind Presidio.",
      "credits.faker.desc": "Synthetic German names, addresses and contact data; the de_DE first-name export powers the browser demo.",
      "credits.n8n.desc": "Workflow glue and the human review step.",
      "credits.ollama.desc": "Local model runtime, used only for the optional local run.",
      "credits.service.name": "Service and client",
      "credits.service.desc": "FastAPI (MIT), pydantic (MIT), httpx (BSD-3-Clause), uvicorn (BSD-3-Clause).",
      "credits.runtime.name": "Runtime libraries",
      "credits.runtime.desc": "Starlette (BSD-3-Clause), AnyIO (MIT), phonenumbers (Apache-2.0), tldextract (BSD-3-Clause), requests (Apache-2.0), numpy (BSD-3-Clause and other open licences), PyYAML (MIT).",
      "credits.dev.name": "Development tools",
      "credits.dev.desc": "pytest, pytest-cov and pytest-socket (MIT), hypothesis (MPL-2.0), ruff and mypy (MIT), uv and uv_build (MIT OR Apache-2.0), gitleaks (MIT).",
      "credits.ported.name": "Ported adapter pattern",
      "credits.ported.desc": "SaberOps worker adapters, the origin of the backend layer; attribution headers are retained.",
      "credits.model.name": "Local model",
      "credits.model.desc": "Qwen2.5 1.5B Instruct, downloaded at run time by Ollama; not redistributed here.",
      "credits.assets.name": "Icons and illustrations",
      "credits.assets.desc": "Inline SVG adapted from the portfolio source, including its Feather GitHub icon. No external images or icon script.",
      "credits.assets.lic": "Feather: MIT · Other SVG: this page",
      "credits.font.name": "IBM Plex Sans + Inter",
      "credits.font.desc": "Plex Sans for the page; Inter for the portfolio author mark. Both typefaces are self-hosted.",
      "footer.built": "Built by Saber Sojudi.", "footer.legal": "Not legal advice.",
      "footer.portfolio": "Portfolio", "footer.github": "GitHub", "footer.top": "Back to top",
      "common.error": "The project data could not be loaded. Reload the page to try again. The browser demo still works.",
      "common.dash": "—",
      "brand.author": "Saber Sojudi",
      "brand.project": "AI Privacy Filter",
      "nav.overview": "Overview",
      "nav.demo": "Demo",
      "nav.evidence": "Results",
      "nav.method": "Method",
      "nav.back": "Back",
      "a.back": "Back to the portfolio",
      "a.quick": "Quick navigation",
      "overview.preview.note": "Synthetic example from the project data",
      "overview.map.title": "The placeholder map stays local",
      "overview.map.body": "The model works with the pseudonymised message. A guard checks it again before the call; the original values stay in the local process.",
      "overview.evidence": "Measured, with limits",
      "overview.caveat": "Detection can miss values. Read the results with their limits.",
      "overview.results": "See results and limits",
      "overview.role.title": "What I built",
      "overview.role.body": "Detection with Presidio and spaCy, typed placeholders, a second-pass guard, interchangeable AI backends and a human review step in n8n.",
      "common.loading": "Loading the project data…"
    },

    de: {
      "meta.title": "AI Privacy Filter — Saber Sojudi",
      "meta.desc": "Ein Filter, der personenbezogene Daten durch Platzhalter ersetzt, bevor eine Kunden-E-Mail eine KI erreicht, und die echten Werte danach im Entwurf wiederherstellt. Gemessene Ergebnisse, Demo und Grenzen.",
      "skip": "Zum Inhalt springen",
      "brand.sub": "Pseudonymisieren, bevor die KI es sieht",
      "nav.example": "Beispiel", "nav.gallery": "Galerie", "nav.try": "Ausprobieren",
      "nav.how": "So funktioniert es", "nav.workflow": "Prüfschritt", "nav.results": "Ergebnisse",
      "nav.technical": "Details",
      "a.light": "Helles Design", "a.dark": "Dunkles Design", "a.github": "Quellcode auf GitHub ansehen",
      "a.lang": "Sprache", "a.theme": "Design", "a.sections": "Abschnitte", "a.technology": "Technologie", "a.footer": "Fußzeile",

      "hero.eyebrow": "Python-Pipeline · Deutsche E-Mails",
      "hero.title": "AI Privacy Filter",
      "hero.lead": "Ich habe eine Python-Pipeline entwickelt, die personenbezogene Daten in deutschen E-Mails durch Platzhalter ersetzt und die Werte in der Antwort wiederherstellt.",
      "hero.github": "Auf GitHub ansehen", "hero.try": "Ausprobieren",
      "hero.fine": "Alle Beispiele auf dieser Seite sind synthetisch. Es werden keine echten Kunden-E-Mails gezeigt.",
      "hero.card.title": "Lokal zuerst",
      "hero.card.s1.t": "Erkennen", "hero.card.s1.d": "Namen, E-Mails, Telefonnummern, IBANs",
      "hero.card.s2.t": "Ersetzen", "hero.card.s2.d": "Typisierte Platzhalter, pro Nachricht nummeriert",
      "hero.card.s3.t": "Entwerfen", "hero.card.s3.d": "Die KI schreibt mit Platzhaltern, nicht mit Personen",
      "hero.card.s4.t": "Zurücksetzen", "hero.card.s4.d": "Echte Werte kommen lokal zurück",
      "tech.python": "Python", "tech.presidio": "Presidio", "tech.fastapi": "FastAPI", "tech.n8n": "n8n",

      "demo.eyebrow": "Beispiel Schritt für Schritt",
      "demo.title": "Eine E-Mail, von Anfang bis Ende",
      "demo.lead": "Eine synthetische Angebotsanfrage, von Anfang bis Ende. Markierter Text sind personenbezogene Daten; die mittlere Spalte ist alles, was das Modell erhält.",
      "demo.col.original": "Original", "demo.col.original.sub": "Synthetische Anfrage",
      "demo.col.ai": "Was die KI sieht", "demo.col.ai.sub": "Pseudonymisiert",
      "demo.col.final": "Fertiger Entwurf", "demo.col.final.sub": "Werte zurückgesetzt",
      "demo.foot.original": "Markiert = personenbezogene Daten",
      "demo.foot.ai": "[TYP_n] = Platzhalter",
      "demo.foot.final": "Lokal zurückgesetzt vor dem Versand",
      "demo.note": "Der Filter ist für deutschen Text gebaut; die Oberfläche gibt es auf Englisch und Deutsch.",

      "stats.eyebrow": "Gemessene Ergebnisse",
      "stats.title": "Erkannt und übersehen",
      "stats.lead": "Zahlen aus den Testläufen hinter diesem Projekt. Datensätze und Grenzen folgen weiter unten.",
      "stats.note": "Einmal auf zurückgehaltenen Testdaten gemessen. Kein Wert wurde auf dem Testsplit abgestimmt.",
      "kpi.ci.button": "95%-KI",
      "kpi.ci.value": "95%-KI {range}",
      "chart.note": "Die Balken zeigen den gemessenen Wert; die Whisker das 95%-Wilson-Konfidenzintervall.",
      "chart.desc": "Horizontales Balkendiagramm mit 95%-Konfidenzintervallen. Dieselben Zahlen stehen in der Tabelle unter dem Diagramm.",
      "chart.legend": "Legende",
      "chart.th.group": "Gruppe",
      "chart.th.value": "Wert",
      "chart.th.count": "n / N",
      "chart.th.ci": "95%-KI",
      "chart.table.caption": "{title} — Zahlen hinter dem Diagramm",
      "chart.error": "Die Diagrammdaten konnten nicht geladen werden.",

      "workflow.eyebrow": "Der Prüfschritt",
      "workflow.title": "Ein Mensch gibt jeden Entwurf frei",
      "workflow.lead": "In n8n wird eine Anfrage pseudonymisiert, vom Guard geprüft und entworfen. Eine Person sieht den pseudonymisierten Text, Kategorie, Dringlichkeit und den wiederhergestellten Entwurf und gibt ihn frei, bearbeitet oder verwirft ihn.",
      "workflow.caption": "Workflow-Canvas nach einem Demo-Lauf: Anfrage rein, pseudonymisieren, Guard, Entwurf, Prüfung, Ergebnis schreiben. Beide Zweige enden erfolgreich.",
      "workflow.alt": "n8n-Workflow-Canvas nach einer abgeschlossenen Demo-Ausführung; Prüf- und Blockiert-Zweig sind als erfolgreich markiert",
      "workflow.shot.list.caption": "Ausführungsliste: Die Demo-Läufe laufen erfolgreich durch, auch der Lauf, dessen Antwort die prüfende Person bearbeitet hat.",
      "workflow.shot.list.alt": "n8n-Ausführungsliste mit den erfolgreichen synthetischen Demo-Läufen",
      "workflow.shot.form.caption": "Prüfformular: Die prüfende Person hat „Bearbeiten“ gewählt und den Entwurf vor dem Absenden ersetzt. Den menschlichen Schritt gibt es, weil ein Entwurf falsch sein kann oder Kundendaten in die Antwort geraten können.",
      "workflow.shot.form.alt": "n8n-Prüfformular mit gewählter Entscheidung „Bearbeiten“ und einem korrigierten Antwortentwurf",
      "workflow.shot.result.caption": "Ergebnisdatensatz: Die Entscheidung „Bearbeiten“ und die korrigierte Antwort werden so gespeichert.",
      "workflow.shot.result.alt": "Ergebniskarte des bearbeiteten Antwortdatensatzes mit dem Text, den das Modell gesehen hat, und der finalen korrigierten Antwort",

      "gallery.eyebrow": "Beispiele",
      "gallery.title": "Synthetische Anfragen",
      "gallery.lead": "Nach Kategorie filtern. Karte öffnen und Original mit dem vergleichen, was die KI gesehen hat. Markierte Lücken bleiben absichtlich sichtbar.",
      "gallery.filter": "Kategorie", "gallery.all": "Alle",
      "gallery.note": "Jeder Text ist synthetisch. Namen, Adressen, Telefonnummern und IBANs wurden für diese Demo erzeugt.",
      "gallery.count": "{n} von {total} Beispielen",
      "gallery.showOriginal": "Original anzeigen",
      "gallery.missed": "Markierte Lücke",
      "gallery.blocked": "Vor dem Modell gestoppt",
      "gallery.empty": "Keine Beispiele in dieser Kategorie.",
      "gallery.cat.QUOTE_REQUEST": "Angebotsanfrage", "gallery.cat.SUPPORT": "Support",
      "gallery.cat.JOB_APPLICATION": "Bewerbung", "gallery.cat.PARTNERSHIP": "Partnerschaft",
      "gallery.cat.OTHER": "Sonstiges",
      "gallery.urgency.LOW": "Niedrig", "gallery.urgency.NORMAL": "Normal", "gallery.urgency.HIGH": "Hoch",

      "type.PERSON": "Person", "type.ORG": "Organisation", "type.EMAIL": "E-Mail",
      "type.PHONE": "Telefon", "type.IBAN": "IBAN", "type.ADDRESS_STREET": "Straße",
      "type.POSTCODE_CITY": "PLZ + Ort", "type.URL": "URL", "type.VAT_ID": "USt-IdNr.",
      "type.DATE_OF_BIRTH": "Geburtsdatum",

      "backend.claude-cli": "Claude über CLI", "backend.codex-cli": "Codex über CLI",
      "backend.byok": "Cloud-Modell (BYOK)", "backend.ollama": "Ollama, lokal",
      "backend.guard-blocked": "Vom Guard gestoppt",

      "try.eyebrow": "Selbst ausprobieren",
      "try.title": "Den Filter ausprobieren",
      "try.lead": "Fügen Sie eine deutsche E-Mail ein und ersetzen Sie personenbezogene Daten durch Platzhalter. Dieser vereinfachte Filter läuft im Browser-Tab; er ist nicht die Server-Pipeline.",
      "try.banner": "Läuft in Ihrem Browser. Nichts, was Sie eingeben, verlässt diese Seite.",
      "try.label": "Ihr Text", "try.placeholder": "Kunden-E-Mail hier einfügen…",
      "try.button": "Personenbezogene Daten ausblenden", "try.sample": "Beispiel verwenden", "try.clear": "Leeren",
      "try.inputNote": "E-Mail, deutsche Telefonnummer, IBAN mit Prüfsumme, PLZ + Ort, Straße + Nummer, URL, deutsche Vornamen und Anrede-Hinweise.",
      "try.resultLabel": "Was die KI sehen würde",
      "try.empty": "Das Ergebnis erscheint hier, sobald Sie den Button drücken.",
      "try.found": "{n} personenbezogene Angaben ersetzt",
      "try.none": "Dieser vereinfachte Filter hat keine personenbezogenen Daten gefunden.",
      "try.replaced": "Ersetzt:",
      "try.note": "Dieses Feld macht keine Netzwerkanfragen. Es führt nur die links genannten Prüfungen aus.",

      "how.eyebrow": "So funktioniert es",
      "how.title": "Die Pipeline",
      "how.lead": "Personenbezogene Daten werden ersetzt, bevor die Anfrage die Grenze zum KI-Backend überschreitet. Die Platzhalter-Zuordnung bleibt im lokalen Prozess.",
      "how.s1.t": "Erkennen", "how.s1.d": "Namen, E-Mails, IBANs",
      "how.s2.t": "Ersetzen", "how.s2.d": "durch [TYP_n]",
      "how.s3.t": "Guard", "how.s3.d": "erneut scannen vor dem Senden",
      "how.s4.t": "KI-Entwurf", "how.s4.d": "auf pseudonymisiertem Text",
      "how.s5.t": "Zurücksetzen", "how.s5.d": "echte Werte zurück",
      "how.svgTitle": "Fünf Schritte: erkennen, ersetzen, Guard, KI-Entwurf, zurücksetzen",
      "how.legend.local": "Auf Ihrem Rechner", "how.legend.network": "Netzwerkaufruf",
      "how.note": "Schritt 4 spricht als einziger mit einem KI-Backend. Der Guard prüft den pseudonymisierten Text erneut und stoppt den Aufruf, wenn noch ein zugeordneter Wert darin steht.",

      "res.eyebrow": "Ergebnisse und Grenzen",
      "res.title": "Ergebnisse und Grenzen",
      "res.lead": "Ein Testsplit, einmal gemessen. Lücken werden so berichtet, wie sie sind.",
      "res.detection.title": "Erkennung",
      "res.detection.lead": "Eine markierte Stelle gilt nur als erkannt, wenn jedes Zeichen von einer passenden Vorhersage abgedeckt ist.",
      "res.detection.note": "GermEval 2014 dient nur zur Berechnung der Erkennungsraten; es werden keine Sätze gezeigt.",
      "res.th.dataset": "Datensatz", "res.th.recall": "Trefferquote",
      "res.th.missed": "Verpasste Stellen", "res.th.covers": "Umfang",
      "res.germeval.name": "GermEval 2014 (Test)",
      "res.germeval.desc": "{n} Sätze, nur Namen und Organisationen",
      "res.synthetic.name": "Synthetischer Test",
      "res.synthetic.desc": "{n} synthetische E-Mails, {types} Typen personenbezogener Daten",
      "res.misses": "Verpasst: {list}.",
      "res.misses.none": "Keine markierte Stelle wurde verpasst.",
      "res.triage.title": "Antwortentwurf",
      "res.triage.lead": "Jedes Backend hat denselben Fragensatz beantwortet.",
      "res.triage.note": "Gültiges JSON zählt nutzbare Antworten. Kategorie und Dringlichkeit sind exakte Treffer. Vom Filter ersetzte Werte, die ein Backend erreicht haben: {leaks} in {calls} Aufrufen – das prüft nur die Ersetzung; nie erkannte Werte deckt die Rate oben ab.",
      "res.th.backend": "Backend",
      "res.th.validJson": "Gültiges JSON",
      "res.th.category": "Kategorie",
      "res.th.urgency": "Dringlichkeit",
      "res.th.latency": "Median der Antwort",
      "res.th.calls": "Aufrufe",
      "res.limits.title": "Was der Filter nicht erfasst",
      "res.limits.lead": "Bekannte Grenzen, direkt neben den Zahlen.",
      "res.th.limit": "Grenze", "res.th.what": "Was passiert", "res.th.mitigation": "Gegenmaßnahme",
      "res.limits.r1.l": "Namen außerhalb der Liste", "res.limits.r1.w": "Ungewöhnliche oder nicht deutsche Namen können sichtbar bleiben.", "res.limits.r1.m": "Anrede-Hinweise und eine menschliche Prüfung vor dem Senden.",
      "res.limits.r2.l": "Adressen ohne Nummer", "res.limits.r2.w": "Ein Straßenname ohne Hausnummer wird eventuell nicht erkannt.", "res.limits.r2.m": "Für Adressblöcke einen manuellen Prüfschritt ergänzen.",
      "res.limits.r3.l": "PLZ- und Ort-Paare", "res.limits.r3.w": "Manche Paare werden nicht erkannt; der Rest bleibt sichtbar.", "res.limits.r3.m": "Der Guard stoppt den Aufruf, wenn er noch einen zugeordneten Wert findet; eine Person prüft den Rest.",
      "res.limits.r4.l": "Kontext-Rückschlüsse", "res.limits.r4.w": "Ein Modell kann aus dem Zusammenhang weiterhin sensible Fakten ableiten.", "res.limits.r4.m": "Menschen im Prozess behalten; pseudonymisierten Text nicht als veröffentlichungssicher behandeln.",
      "res.limits.r5.l": "Gescannte Dokumente", "res.limits.r5.w": "Text in Bildern wird von diesem Filter nicht erfasst.", "res.limits.r5.m": "OCR und manuelle Prüfung vor dem Senden.",
      "res.limits.r6.l": "Rechtlicher Status", "res.limits.r6.w": "Das Ersetzen von Daten macht eine Verarbeitung nicht automatisch rechtmäßig.", "res.limits.r6.m": "Zweck, Rechtsgrundlage und Verträge separat prüfen.",
      "res.notLegal.title": "Keine Rechtsberatung",
      "res.notLegal.body": "Diese Seite beschreibt einen technischen Filter. Sie ist keine Rechtsberatung und ersetzt keine Prüfung Ihrer Verarbeitung nach Datenschutzrecht.",
      "res.pseudo.title": "Pseudonymisierung bleibt zuordenbar",
      "res.pseudo.body": "Der Filter ersetzt personenbezogene Daten durch Platzhalter. Die Originalwerte bleiben in der lokalen Zuordnung und können wiederhergestellt werden; das Ergebnis bleibt also auf die Person beziehbar.",
      "res.adoption.lead": "Interesse am Einsatz in Ihrem Unternehmen?",
      "res.adoption.link": "Kontakt aufnehmen",

      "tech.eyebrow": "Technische Details",
      "tech.title": "Technische Umsetzung",
      "tech.lead": "Architektur, Erkennungs-Stack, Guard, Backends und die Tests hinter den Datenschutzaussagen.",
      "tech.arch.sum": "Architektur",
      "tech.arch.body": "Ein FastAPI-Dienst nimmt eine Anfrage, erkennt personenbezogene Daten, ersetzt Werte durch typisierte Platzhalter, prüft das Ergebnis erneut, ruft ein KI-Backend und setzt die Platzhalter im zurückgegebenen Entwurf wieder ein. n8n startet den Ablauf; die Platzhalter-Zuordnung bleibt im Speicher und wird nie in die Seitendaten geschrieben.",
      "tech.detect.sum": "Erkennungs-Stack",
      "tech.detect.body": "Microsoft Presidio und spaCy erkennen Namen und Organisationen. Reguläre Ausdrücke mit Prüfsummen erkennen E-Mails, deutsche Telefonnummern, IBANs, PLZ mit Ort, Straße mit Nummer, URLs und USt-IdNrn. Die Browser-Demo ergänzt eine Faker-de_DE-Vornamenliste und Anrede-Hinweise.",
      "tech.guard.sum": "Der Guard",
      "tech.guard.body": "Vor jedem KI-Aufruf vergleicht ein zweiter Durchlauf den pseudonymisierten Text mit den Werten aus dem Original. Er prüft normalisierte Originale und reine Ziffernformen für Telefonnummern und IBANs. Bei einem Leck wird der Aufruf gestoppt; das Ergebnis nennt die Typen, nie die Werte.",
      "tech.backends.sum": "KI-Backends",
      "tech.backends.body": "Vier Backends hinter einer Schnittstelle: Claude und Codex über ihre CLIs, ein BYOK-Chat-Completions-Endpunkt und ein lokales Ollama-Modell. Die Ergebnistabelle erfasst jeden Aufruf des Antwortentwurf-Tests.",
      "tech.test.sum": "Netzwerkfreier Test der Demo",
      "tech.test.body": "Das Ausprobieren-Feld wurde mit Browser-Netzwerkprotokoll geprüft: Tippen und Drücken des Buttons erzeugten keine Anfragen. Die Aussage gilt nur für dieses Feld; der Rest der Seite lädt ihre zwei JSON-Dateien einmal.",
      "tech.data.sum": "Testdaten und Berichterstattung",
      "tech.data.body": "Alle Anfragen auf dieser Seite sind synthetisch, aus handgeschriebenen Vorlagen und Faker-de_DE-Werten. GermEval 2014 wird per Skript geladen, ist git-ignoriert, wird nie gezeigt und nie an ein Modell gesendet; veröffentlicht werden nur Erkennungsraten. Markierte Lücken werden so berichtet, wie sie sind.",
      "tech.repro.sum": "Reproduzierbarkeit",
      "tech.repro.body": "Die Seitendaten tragen Version, Commit, Zeitstempel und SHA-256 des Laufs. Ein kleines Prüfskript kontrolliert, dass jede Kennzahl und jeder Diagrammwert dem Wert in kpis.json und charts/*.json entspricht.",

      "credits.eyebrow": "Daten und Quellen",
      "credits.title": "Quellen und Lizenzen",
      "credits.lead": "Offene Werkzeuge und ein Forschungsdatensatz, mit Lizenz und Grenze.",
      "credits.germeval.desc": "Deutschsprachige Wikipedia- und Nachrichtentexte. Nur zur Berechnung der Erkennungsraten; keine Sätze gezeigt.",
      "credits.presidio.desc": "PII-Erkennung für Namen, Organisationen und mehr.",
      "credits.spacy.desc": "Deutsche NLP mit dem Modell de_core_news_lg hinter Presidio.",
      "credits.faker.desc": "Synthetische deutsche Namen, Adressen und Kontaktdaten; der de_DE-Vornamenexport betreibt die Browser-Demo.",
      "credits.n8n.desc": "Workflow-Verklebung und der menschliche Prüfschritt.",
      "credits.ollama.desc": "Laufzeit für lokale Modelle, nur für den optionalen lokalen Lauf.",
      "credits.service.name": "Dienst und Client",
      "credits.service.desc": "FastAPI (MIT), pydantic (MIT), httpx (BSD-3-Clause), uvicorn (BSD-3-Clause).",
      "credits.runtime.name": "Laufzeitbibliotheken",
      "credits.runtime.desc": "Starlette (BSD-3-Clause), AnyIO (MIT), phonenumbers (Apache-2.0), tldextract (BSD-3-Clause), requests (Apache-2.0), numpy (BSD-3-Clause und weitere offene Lizenzen), PyYAML (MIT).",
      "credits.dev.name": "Entwicklungswerkzeuge",
      "credits.dev.desc": "pytest, pytest-cov und pytest-socket (MIT), hypothesis (MPL-2.0), ruff und mypy (MIT), uv und uv_build (MIT OR Apache-2.0), gitleaks (MIT).",
      "credits.ported.name": "Portiertes Adapter-Muster",
      "credits.ported.desc": "SaberOps-Worker-Adapter, der Ursprung der Backend-Schicht; Attributionshinweise bleiben erhalten.",
      "credits.model.name": "Lokales Modell",
      "credits.model.desc": "Qwen2.5 1.5B Instruct, zur Laufzeit von Ollama geladen; hier nicht weitergegeben.",
      "credits.assets.name": "Icons und Illustrationen",
      "credits.assets.desc": "Inline-SVG aus dem Portfolio-Quellcode übernommen, einschließlich des Feather-GitHub-Icons. Keine externen Bilder oder Icon-Skripte.",
      "credits.assets.lic": "Feather: MIT · Weitere SVG: diese Seite",
      "credits.font.name": "IBM Plex Sans + Inter",
      "credits.font.desc": "Plex Sans für die Seite; Inter für den Namenszug im Portfolio. Beide Schriften werden selbst gehostet.",
      "footer.built": "Gebaut von Saber Sojudi.", "footer.legal": "Keine Rechtsberatung.",
      "footer.portfolio": "Portfolio", "footer.github": "GitHub", "footer.top": "Nach oben",
      "common.error": "Die Projektdaten konnten nicht geladen werden. Laden Sie die Seite erneut. Die Browser-Demo funktioniert weiterhin.",
      "common.dash": "—",
      "brand.author": "Saber Sojudi",
      "brand.project": "AI Privacy Filter",
      "nav.overview": "Überblick",
      "nav.demo": "Demo",
      "nav.evidence": "Ergebnisse",
      "nav.method": "Methode",
      "nav.back": "Zurück",
      "a.back": "Zurück zum Portfolio",
      "a.quick": "Schnellnavigation",
      "overview.preview.note": "Synthetisches Beispiel aus den Projektdaten",
      "overview.map.title": "Die Zuordnung bleibt lokal",
      "overview.map.body": "Das Modell arbeitet mit der pseudonymisierten Nachricht. Ein Guard prüft sie vor dem Aufruf erneut; die Originalwerte bleiben im lokalen Prozess.",
      "overview.evidence": "Gemessen, mit Grenzen",
      "overview.caveat": "Die Erkennung kann Werte übersehen. Ergebnisse und Grenzen gehören zusammen.",
      "overview.results": "Ergebnisse und Grenzen ansehen",
      "overview.role.title": "Was ich entwickelt habe",
      "overview.role.body": "Erkennung mit Presidio und spaCy, typisierte Platzhalter, einen zweiten Prüfpass, austauschbare KI-Backends und einen menschlichen Prüfschritt in n8n.",
      "common.loading": "Projektdaten werden geladen…"
    }
  };

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var EXAMPLES = [];
  var RESULTS = null;
  var KPIS = [];
  var CHARTS = {};
  var syncNavigation = null;
  var FILTER = 'all';
  var LANG = (document.documentElement.lang || 'en').toLowerCase().indexOf('de') === 0 ? 'de' : 'en';
  var LOCALE = function () { return LANG === 'de' ? 'de-DE' : 'en-US'; };

  function t(key) {
    return (I18N[LANG] && I18N[LANG][key]) || I18N.en[key] || key;
  }
  function tf(key, values) {
    var out = t(key);
    Object.keys(values || {}).forEach(function (k) { out = out.split('{' + k + '}').join(String(values[k])); });
    return out;
  }
  function esc(value) {
    return String(value).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function fmt(value, digits) {
    return Number(value).toLocaleString(LOCALE(), {
      minimumFractionDigits: digits || 0,
      maximumFractionDigits: digits || 0
    });
  }
  function pct(value, digits) { return fmt(value, digits == null ? 1 : digits) + '%'; }
  function entClass(type) { return 'ent-' + String(type).toLowerCase().replace(/_/g, '-'); }
  function totals() { return window.AIPF_RESULTS_MODEL; }

  /* ---------- theme ---------- */
  function systemTheme() {
    try { return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
    catch (e) { return 'light'; }
  }
  function syncThemeButtons() {
    var current = document.documentElement.dataset.theme || systemTheme();
    $$('#theme button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.themeSet === current)); });
    var color = $('meta[name="theme-color"]');
    if (color) color.setAttribute('content', getComputedStyle(document.documentElement).getPropertyValue('--bg-page').trim());
  }
  function setTheme(value) {
    document.documentElement.dataset.theme = value;
    try { localStorage.setItem('aipf-theme', value); } catch (e) { /* private mode */ }
    try {
      var url = new URL(location.href);
      url.searchParams.set('theme', value);
      history.replaceState(null, '', url);
    } catch (e) { /* history is best-effort */ }
    syncThemeButtons();
  }

  /* ---------- language ---------- */
  function syncLangButtons() {
    $$('#lang button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === LANG)); });
  }
  function setLang(value) {
    LANG = value === 'de' ? 'de' : 'en';
    try { localStorage.setItem('aipf-lang', LANG); } catch (e) { /* private mode */ }
    try {
      var url = new URL(location.href);
      url.searchParams.set('lang', LANG);
      history.replaceState(null, '', url);
    } catch (e) { /* file:// */ }
    applyLang();
  }
  function applyLang() {
    document.documentElement.lang = LANG;
    document.title = t('meta.title');
    var meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', t('meta.desc'));
    $$('[data-i18n]').forEach(function (el) {
      var key = el.dataset.i18n;
      if (key === 'try.empty' && el.dataset.state === 'filled') return;
      el.textContent = t(key);
    });
    $$('[data-i18n-label]').forEach(function (el) { el.setAttribute('aria-label', t(el.dataset.i18nLabel)); });
    $$('[data-i18n-placeholder]').forEach(function (el) { el.setAttribute('placeholder', t(el.dataset.i18nPlaceholder)); });
    $$('[data-i18n-alt]').forEach(function (el) { el.setAttribute('alt', t(el.dataset.i18nAlt)); });
    syncLangButtons();
    syncThemeButtons();
    renderAll();
    if (window.AIPF_TRYIT && typeof window.AIPF_TRYIT.refresh === 'function') window.AIPF_TRYIT.refresh();
  }

  /* ---------- highlighting ---------- */
  function marked(text, spans, misses) {
    var all = [];
    (spans || []).forEach(function (s) {
      all.push({ start: s.start, end: s.end, cls: 'ent ' + entClass(s.type), title: t('type.' + s.type) });
    });
    (misses || []).forEach(function (m) {
      if (typeof m.start === 'number') all.push({ start: m.start, end: m.end, cls: 'ent miss', title: t('gallery.missed') + ': ' + t('type.' + m.type) });
    });
    all.sort(function (a, b) { return a.start - b.start || b.end - a.end; });
    var out = '', pos = 0;
    all.forEach(function (s) {
      if (s.start < pos || s.start < 0 || s.end > text.length) return;
      out += esc(text.slice(pos, s.start));
      out += '<mark class="' + s.cls + '" title="' + esc(s.title) + '">' + esc(text.slice(s.start, s.end)) + '</mark>';
      pos = s.end;
    });
    return out + esc(text.slice(pos));
  }
  function phMarked(text) {
    return esc(text).replace(/(\[[A-Z_]+_\d+\])/g, '<code class="ph">$1</code>');
  }
  function findSpans(text, spans) {
    var found = [];
    (spans || []).forEach(function (s) {
      var from = 0, i;
      while ((i = text.indexOf(s.text, from)) !== -1) {
        found.push({ start: i, end: i + s.text.length, type: s.type });
        from = i + s.text.length;
      }
    });
    found.sort(function (a, b) { return a.start - b.start || b.end - a.end; });
    var out = [], end = -1;
    found.forEach(function (s) { if (s.start >= end) { out.push(s); end = s.end; } });
    return out;
  }

  /* ---------- demo ---------- */
  function renderDemo() {
    var grid = $('#demo-grid');
    var meta = $('#demo-meta');
    var legend = $('#demo-legend');
    if (!grid || !EXAMPLES.length) return;
    var ex = EXAMPLES.filter(function (x) { return x.reply_draft_restored; })[0] || EXAMPLES[0];
    var preview = $('#hero-preview');
    if (preview) preview.innerHTML = phMarked(ex.redacted.split(/\n\s*\n/)[0]);

    meta.innerHTML =
      '<span class="chip chip-accent">' + esc(t('gallery.cat.' + ex.category)) + '</span>' +
      '<span class="chip ' + (ex.urgency === 'HIGH' ? 'chip-warn' : '') + '">' + esc(t('gallery.urgency.' + ex.urgency)) + '</span>' +
      '<span class="chip">' + esc(t('backend.' + ex.backend)) + '</span>';

    var restored = findSpans(ex.reply_draft_restored || '', ex.spans || []);
    var columns = [
      {
        cls: '', title: t('demo.col.original'), sub: t('demo.col.original.sub'),
        body: marked(ex.original, ex.spans, ex.misses),
        foot: t('demo.foot.original')
      },
      {
        cls: '', title: t('demo.col.ai'), sub: t('demo.col.ai.sub'),
        body: phMarked(ex.redacted),
        foot: t('demo.foot.ai')
      },
      {
        cls: ' final', title: t('demo.col.final'), sub: t('demo.col.final.sub'),
        body: marked(ex.reply_draft_restored, restored, []),
        foot: t('demo.foot.final')
      }
    ];

    grid.innerHTML = columns.map(function (c) {
      return '<article class="demo-col' + c.cls + '">' +
        '<header><strong>' + esc(c.title) + '</strong><span>' + esc(c.sub) + '</span></header>' +
        '<div class="demo-body">' + c.body + '</div>' +
        '<div class="demo-foot">' + esc(c.foot) + '</div></article>';
    }).join('');

    var types = [];
    (ex.spans || []).forEach(function (s) { if (types.indexOf(s.type) === -1) types.push(s.type); });
    legend.innerHTML = types.map(function (type) {
      return '<span class="legend-item"><span class="swatch ' + entClass(type) + '"></span>' + esc(t('type.' + type)) + '</span>';
    }).join('') +
      '<span class="legend-item"><span class="swatch" style="background:var(--accent-soft)"></span><code>[TYPE_n]</code></span>';
  }

  /* ---------- KPI row and charts ---------- */
  /* Four cards in reading order. Every value, count and interval comes from
     data/kpis.json; nothing is typed into this file. */
  var KPI_ORDER = ['synthetic_recall_b2', 'leak_rate_b2', 'over_masking_b2', 'germeval_combined_recall_b2'];

  function brief(value) {
    return Number(value).toLocaleString(LOCALE(), { maximumFractionDigits: 1 });
  }
  function ciRange(ci) {
    return brief(ci[0]) + '–' + brief(ci[1]) + '%';
  }
  function renderKpis() {
    var grid = $('#kpi-grid');
    if (!grid || !KPIS.length) return;
    grid.innerHTML = KPI_ORDER.map(function (id) {
      var kpi = null;
      KPIS.forEach(function (item) { if (item.id === id) kpi = item; });
      if (!kpi) return '';
      var label = (kpi.label && (kpi.label[LANG] || kpi.label.en)) || kpi.id;
      var range = ciRange(kpi.ci95);
      var ciId = 'kpi-ci-' + kpi.id;
      return '<article class="stat kpi" data-kpi="' + esc(kpi.id) + '" data-value="' + esc(kpi.value) + '">' +
        '<span class="stat-value kpi-value">' + esc(brief(kpi.value) + '%') + '</span>' +
        '<span class="stat-note kpi-count">' + esc(fmt(kpi.numerator, 0) + ' / ' + fmt(kpi.denominator, 0)) + '</span>' +
        '<span class="stat-label kpi-label">' + esc(label) + '</span>' +
        '<span class="kpi-ci-wrap">' +
        '<button type="button" class="kpi-ci-btn" aria-describedby="' + esc(ciId) + '">' + esc(t('kpi.ci.button')) + '</button>' +
        '<span class="kpi-ci" id="' + esc(ciId) + '" role="tooltip">' + esc(tf('kpi.ci.value', { range: range })) + '</span>' +
        '</span>' +
        '</article>';
    }).join('');
  }

  function renderCharts() {
    if (!window.AIPF_CHARTS) return;
    $$('[data-chart-slot]').forEach(function (slot) {
      var id = slot.dataset.chartSlot;
      var chart = CHARTS[id];
      if (!chart) {
        slot.innerHTML = '<p class="notice">' + esc(t('chart.error')) + '</p>';
        return;
      }
      window.AIPF_CHARTS.mount(slot, chart, { lang: LANG, locale: LOCALE(), t: t, tf: tf });
    });
  }

  /* ---------- gallery ---------- */
  function categories() {
    var out = [];
    EXAMPLES.forEach(function (x) { if (out.indexOf(x.category) === -1) out.push(x.category); });
    return out;
  }
  function renderFilters() {
    var box = $('#gallery-filters');
    if (!box) return;
    var list = ['all'].concat(categories());
    box.innerHTML = list.map(function (c) {
      var label = c === 'all' ? t('gallery.all') : t('gallery.cat.' + c);
      return '<button type="button" class="filter" data-category="' + esc(c) + '" aria-pressed="' + String(FILTER === c) + '">' + esc(label) + '</button>';
    }).join('');
    $$('.filter', box).forEach(function (b) {
      b.addEventListener('click', function () {
        var keyboard = document.activeElement === b && b.matches(':focus-visible');
        FILTER = b.dataset.category;
        renderGallery();
        if (keyboard) {
          var active = $('#gallery-filters [aria-pressed="true"]');
          if (active) active.focus({ preventScroll: true });
        }
      });
    });
  }
  function renderGallery() {
    var grid = $('#gallery-grid');
    var count = $('#gallery-count');
    if (!grid) return;
    renderFilters();
    var shown = EXAMPLES.filter(function (x) { return FILTER === 'all' || x.category === FILTER; });
    if (count) count.textContent = tf('gallery.count', { n: shown.length, total: EXAMPLES.length });

    if (!shown.length) {
      grid.innerHTML = '<p class="empty">' + esc(t('gallery.empty')) + '</p>';
      return;
    }
    grid.innerHTML = shown.map(function (x) {
      var blocked = !x.reply_draft_restored;
      var miss = (x.misses || []).length
        ? '<div class="miss-box"><strong>' + esc(t('gallery.missed')) + '</strong><ul>' +
          x.misses.map(function (m) {
            return '<li><span class="miss-type">' + esc(t('type.' + m.type)) + '</span> ' + esc(m.text) + '</li>';
          }).join('') + '</ul></div>'
        : '';
      return '<article class="ex-card' + (miss ? ' has-miss' : '') + '">' +
        '<div class="ex-top">' +
        '<span class="chip chip-accent">' + esc(t('gallery.cat.' + x.category)) + '</span>' +
        '<span class="chip ' + (x.urgency === 'HIGH' ? 'chip-warn' : '') + '">' + esc(t('gallery.urgency.' + x.urgency)) + '</span>' +
        (blocked ? '<span class="chip chip-danger">' + esc(t('gallery.blocked')) + '</span>' : '') +
        (miss ? '<span class="chip chip-danger">' + esc(t('gallery.missed')) + '</span>' : '') +
        '</div>' +
        '<p class="ex-red">' + phMarked(x.redacted) + '</p>' +
        '<details><summary>' + esc(t('gallery.showOriginal')) + '</summary>' +
        '<div class="ex-orig">' + marked(x.original, x.spans, x.misses) + '</div>' +
        '<div class="ex-complete"><strong>' + esc(t('demo.col.ai')) + '</strong>' +
        '<div class="ex-orig">' + phMarked(x.redacted) + '</div></div></details>' +
        miss +
        '</article>';
    }).join('');
  }

  /* ---------- results tables ---------- */
  function detectionRows() {
    var s = RESULTS.detection.synthetic;
    var g = RESULTS.detection.germeval;
    var syn = totals().syntheticTotals(s.baselines.B2);
    var germ = g.baselines.B2;
    var germMissed = germ.micro_primary.gold - germ.micro_primary.protected;
    return {
      syn: syn,
      germ: germ,
      germMissed: germMissed,
      rows: [
        {
          name: t('res.synthetic.name'),
          covers: tf('res.synthetic.desc', { n: fmt(s.records, 0), types: fmt(s.types.length, 0) }),
          recall: totals().pct(syn.caught, syn.gold, 1, LOCALE()),
          missed: fmt(syn.missed, 0)
        },
        {
          name: t('res.germeval.name'),
          covers: tf('res.germeval.desc', { n: fmt(g.sentences, 0) }),
          recall: fmt(germ.micro_primary.recall_pct, 1) + '%',
          missed: fmt(germMissed, 0)
        }
      ]
    };
  }
  function renderResults() {
    var det = $('#detection-body');
    var tri = $('#triage-body');
    var lim = $('#limits-body');
    if (!RESULTS) return;

    if (det) {
      var info = detectionRows();
      det.innerHTML = info.rows.map(function (row) {
        return '<tr>' +
          '<td><strong>' + esc(row.name) + '</strong><small>' + esc(row.covers) + '</small></td>' +
          '<td class="num">' + esc(row.recall) + '</td>' +
          '<td class="num">' + esc(row.missed) + '</td>' +
          '</tr>';
      }).join('');

      var missedTypes = [];
      var perType = RESULTS.detection.synthetic.baselines.B2.per_type;
      Object.keys(perType).forEach(function (type) {
        if (perType[type].missed > 0) {
          missedTypes.push(t('type.' + type) + ' ×' + fmt(perType[type].missed, 0));
        }
      });
      var list = missedTypes.join(' · ');
      var miss = $('#detection-misses');
      if (miss) miss.textContent = list
        ? tf('res.misses', { list: list })
        : t('res.misses.none');
    }

    if (tri) {
      tri.innerHTML = Object.keys(RESULTS.triage.per_backend).map(function (name) {
        var b = RESULTS.triage.per_backend[name];
        return '<tr>' +
          '<td><strong>' + esc(t('backend.' + name)) + '</strong></td>' +
          '<td class="num">' + pct(b.success / b.calls * 100, 1) + '</td>' +
          '<td class="num">' + pct(b.category_only.rate * 100, 1) + '</td>' +
          '<td class="num">' + pct(b.urgency_only.rate * 100, 1) + '</td>' +
          '<td class="num">' + fmt(b.latency_ms.median / 1000, 1) + ' s</td>' +
          '<td class="num">' + fmt(b.calls, 0) + '</td>' +
          '</tr>';
      }).join('');
      var triageTotals = totals().triageTotals(RESULTS.triage.per_backend);
      var note = $('#triage-note');
      if (note) note.textContent = tf('res.triage.note', { leaks: fmt(triageTotals.leaks, 0), calls: fmt(triageTotals.calls, 0) });
    }

    if (lim) {
      lim.innerHTML = [1, 2, 3, 4, 5, 6].map(function (n) {
        return '<tr>' +
          '<td><strong>' + esc(t('res.limits.r' + n + '.l')) + '</strong></td>' +
          '<td>' + esc(t('res.limits.r' + n + '.w')) + '</td>' +
          '<td>' + esc(t('res.limits.r' + n + '.m')) + '</td>' +
          '</tr>';
      }).join('');
    }
  }

  function renderAll() {
    renderDemo();
    renderKpis();
    renderCharts();
    renderGallery();
    renderResults();
    labelTableCells();
    if (syncNavigation) syncNavigation();
  }

  /* The translated headers label narrow rows; semantic tables stay intact. */
  function labelTableCells() {
    $$('.table-wrap > table').forEach(function (table) {
      var labels = $$('thead th', table).map(function (th) { return th.textContent; });
      $$('tbody tr', table).forEach(function (row) {
        $$('td', row).forEach(function (cell, index) {
          cell.setAttribute('data-label', labels[index] || '');
        });
      });
      table.parentElement.removeAttribute('tabindex');
    });
  }

  /* Native hashes retain deep links and Back; these links are not tabs. */
  function initNavigation() {
    function select(group) {
      $$('[data-nav]').forEach(function (link) {
        if (link.dataset.nav === group) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
    function fromHash() {
      var target = document.getElementById(location.hash.slice(1));
      var section = target && target.closest('[data-nav-section]');
      if (section) select(section.dataset.navSection);
      else if (!location.hash) select('overview');
    }
    var sections = $$('[data-nav-section]');
    var header = $('.site-header');
    var scheduled = false;
    function schedule() {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(function () {
        scheduled = false;
        var marker = Math.max(header.getBoundingClientRect().bottom + 24, innerHeight / 4);
        var group = 'overview';
        sections.forEach(function (section) {
          if (section.getBoundingClientRect().top <= marker) group = section.dataset.navSection;
        });
        select(group);
      });
    }
    syncNavigation = schedule;
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    window.addEventListener('hashchange', fromHash);
    fromHash();
    schedule();
  }

  /* ---------- data ---------- */
  function load() {
    var base = new URL('data/', location.href);
    var get = function (name) {
      return fetch(new URL(name, base).href, { cache: 'no-store' }).then(function (r) {
        if (!r.ok) throw new Error(name + ': HTTP ' + r.status);
        return r.json();
      });
    };
    Promise.all([
      get('examples.json'),
      get('results.json'),
      get('kpis.json'),
      get('charts/leak-rate-by-detector.json'),
      get('charts/synthetic-recall-by-type.json'),
      get('charts/triage-accuracy-by-backend.json')
    ]).then(function (out) {
      EXAMPLES = Array.isArray(out[0]) ? out[0] : (out[0].examples || []);
      RESULTS = out[1];
      KPIS = Array.isArray(out[2]) ? out[2] : (out[2].kpis || []);
      CHARTS = {};
      [out[3], out[4], out[5]].forEach(function (chart) {
        if (chart && chart.id) CHARTS[chart.id] = chart;
      });
      var sample = EXAMPLES.filter(function (x) { return x.reply_draft_restored; })[0] || EXAMPLES[0];
      window.AIPF_SAMPLE = sample ? sample.original : '';
      renderAll();
      if (window.AIPF_TRYIT && typeof window.AIPF_TRYIT.refresh === 'function') window.AIPF_TRYIT.refresh();
    }).catch(function (err) {
      ['#hero-preview', '#demo-grid', '#kpi-grid', '#gallery-grid'].forEach(function (selector) {
        var grid = $(selector);
        if (grid) grid.innerHTML = '<p class="notice">' + esc(t('common.error')) + '</p>';
      });
      // A missing data file is a real page error; keep it visible for the smoke test.
      console.error('AI Privacy Filter: data load failed', err);
    });
  }

  /* ---------- init ---------- */
  window.AIPF_I18N = {
    t: t,
    tf: tf,
    get lang() { return LANG; }
  };

  $$('#lang button').forEach(function (b) {
    b.addEventListener('click', function () { setLang(b.dataset.lang); });
  });
  $$('#theme button').forEach(function (b) {
    b.addEventListener('click', function () { setTheme(b.dataset.themeSet); });
  });

  applyLang();
  initNavigation();
  load();
})();
