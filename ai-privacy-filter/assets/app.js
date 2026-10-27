/* AI Privacy Filter — page logic and the English/German dictionary.
   No build step: plain DOM, fetch for the two JSON files, localStorage for
   language and theme (both wrapped in try/catch). */
(function () {
  'use strict';

  var I18N = {
    en: {
      "meta.title": "AI Privacy Filter — Saber Sojudi",
      "meta.desc": "A filter that replaces personal data with placeholders before a customer email reaches an AI, then restores the real values in the draft. Demo, results and limits.",
      "skip": "Skip to the content",
      "brand.sub": "Pseudonymise before the AI sees it",
      "nav.example": "Example", "nav.gallery": "Gallery", "nav.try": "Try it",
      "nav.how": "How it works", "nav.results": "Results", "nav.technical": "Details",
      "a.light": "Light theme", "a.dark": "Dark theme", "a.github": "View the source on GitHub",
      "a.lang": "Language", "a.theme": "Theme", "a.sections": "Sections", "a.technology": "Technology", "a.footer": "Footer",

      "hero.eyebrow": "Portfolio project · Privacy engineering",
      "hero.title": "Use AI on customer emails without sending personal data",
      "hero.lead": "A filter replaces names, addresses, IBANs and other personal data with placeholders before an email reaches a language model — and puts the real values back into the draft afterwards.",
      "hero.github": "View on GitHub", "hero.try": "Try it",
      "hero.fine": "All examples on this page are synthetic. No real customer emails are shown.",
      "hero.card.title": "Local first",
      "hero.card.s1.t": "Detect", "hero.card.s1.d": "Names, emails, phone numbers, IBANs",
      "hero.card.s2.t": "Replace", "hero.card.s2.d": "Typed placeholders, numbered per message",
      "hero.card.s3.t": "Draft", "hero.card.s3.d": "The AI writes with placeholders, not people",
      "hero.card.s4.t": "Restore", "hero.card.s4.d": "Real values go back in on your machine",
      "tech.python": "Python", "tech.presidio": "Presidio", "tech.fastapi": "FastAPI", "tech.n8n": "n8n",

      "demo.eyebrow": "Real example",
      "demo.title": "What goes in, what the AI sees, what comes out",
      "demo.lead": "One synthetic quote request, shown end to end. Highlighted text is personal data; the middle column is what the model receives.",
      "demo.col.original": "Original", "demo.col.original.sub": "Synthetic enquiry",
      "demo.col.ai": "What the AI sees", "demo.col.ai.sub": "Pseudonymised",
      "demo.col.final": "Final draft", "demo.col.final.sub": "Values restored",
      "demo.foot.original": "Highlighted = personal data",
      "demo.foot.ai": "[TYPE_n] = placeholder",
      "demo.foot.final": "Restored locally before sending",
      "demo.note": "The example is German because the target market is German-speaking. The interface is available in English and German.",
      "mock.badge": "Preview data",
      "mock.text": "the measured numbers and final examples will replace these before launch.",

      "stats.eyebrow": "Headline numbers",
      "stats.title": "What the filter found, and how fast",
      "stats.lead": "Preview figures from the mock run. Each card says what the number means.",
      "stats.note": "Preview values, already marked as mock in the data file. The measured run replaces them before launch.",
      "stats.spans": "Personal-data spans found",
      "stats.spans.meaning": "Across 240 synthetic test enquiries, duplicates counted once per span.",
      "stats.recall": "Detection recall",
      "stats.recall.meaning": "Share of labelled personal-data spans the filter replaced.",
      "stats.guard": "Guard pass rate",
      "stats.guard.meaning": "Share of messages that passed the re-scan before any AI call.",
      "stats.latency": "Median end-to-end time",
      "stats.latency.meaning": "From email in to draft out, measured locally.",

      "gallery.eyebrow": "Examples",
      "gallery.title": "Fifteen synthetic enquiries",
      "gallery.lead": "Filter by tone. Open any card to compare the original with what the AI sees. Three labelled misses stay visible on purpose.",
      "gallery.filter": "Style", "gallery.all": "All",
      "gallery.note": "Every text is synthetic. Names, addresses, phone numbers and IBANs were generated for this demo.",
      "gallery.count": "{n} of {total} examples",
      "gallery.showOriginal": "Show original",
      "gallery.missed": "Labelled miss",
      "gallery.empty": "No examples in this style.",
      "gallery.style.formal": "Formal", "gallery.style.informal": "Informal",
      "gallery.style.urgent": "Urgent", "gallery.style.angry": "Angry", "gallery.style.short": "Short",
      "gallery.cat.QUOTE_REQUEST": "Quote request", "gallery.cat.SUPPORT": "Support",
      "gallery.cat.JOB_APPLICATION": "Job application", "gallery.cat.PARTNERSHIP": "Partnership",
      "gallery.cat.OTHER": "Other",
      "gallery.urgency.LOW": "Low", "gallery.urgency.NORMAL": "Normal", "gallery.urgency.HIGH": "High",

      "type.PERSON": "Person", "type.ORG": "Organisation", "type.EMAIL": "Email",
      "type.PHONE": "Phone", "type.IBAN": "IBAN", "type.ADDRESS_STREET": "Street",
      "type.POSTCODE_CITY": "Postcode + city", "type.URL": "URL", "type.VAT_ID": "VAT ID",
      "type.DATE_OF_BIRTH": "Date of birth",
      "miss.name_not_in_list": "name not in the German first-name list",
      "miss.street_without_number": "street without a house number",
      "miss.phone_spelled_out": "phone number written as words",

      "try.eyebrow": "Try it yourself",
      "try.title": "Paste an email and hide the personal data",
      "try.lead": "The filter below runs in this browser tab only. It is a simplified version of the server-side pipeline.",
      "try.banner": "Simplified browser version. Nothing you type leaves your browser.",
      "try.label": "Your text", "try.placeholder": "Paste a customer email here…",
      "try.button": "Hide personal data", "try.sample": "Use a sample", "try.clear": "Clear",
      "try.inputNote": "Runs locally. Email, German phone, IBAN with checksum, postcode + city, street + number, URL, German first names and salutation cues.",
      "try.resultLabel": "What the AI would see",
      "try.empty": "The result appears here after you press the button.",
      "try.found": "{n} personal data items replaced",
      "try.none": "No personal data found by this simplified filter.",
      "try.replaced": "Replaced:",
      "try.note": "Nothing is sent anywhere. The box makes no network requests; it uses only the checks listed on the left.",

      "how.eyebrow": "How it works",
      "how.title": "Five steps, one boundary",
      "how.lead": "Personal data is replaced before the request crosses to the AI backend. The placeholder map never leaves the local process.",
      "how.s1.t": "Detect", "how.s1.d": "names, emails, IBANs",
      "how.s2.t": "Replace", "how.s2.d": "with [TYPE_n]",
      "how.s3.t": "Guard", "how.s3.d": "re-scan before sending",
      "how.s4.t": "AI draft", "how.s4.d": "on pseudonymised text",
      "how.s5.t": "Restore", "how.s5.d": "real values back",
      "how.svgTitle": "Five-step flow: detect, replace, guard, AI draft, restore",
      "how.legend.local": "On your machine", "how.legend.network": "Network call",
      "how.note": "Step 4 is the only one that talks to an AI backend. The guard re-scans the pseudonymised text and blocks the call if anything was missed.",

      "res.eyebrow": "Results and limits",
      "res.title": "Numbers with their caveats",
      "res.lead": "Preview figures. GermEval numbers are pending; synthetic numbers are mock values. Misses are reported, not hidden.",
      "res.detection.title": "Detection",
      "res.detection.lead": "Span-level precision, recall and F1.",
      "res.detection.note": "GermEval 2014 is used only to compute detection rates; no sentences are shown.",
      "res.th.dataset": "Dataset", "res.th.precision": "Precision", "res.th.recall": "Recall",
      "res.th.f1": "F1", "res.th.spans": "Spans", "res.th.status": "Status",
      "res.germeval.name": "GermEval 2014 (test)", "res.germeval.desc": "German legal texts · numbers only",
      "res.synthetic.name": "Synthetic test", "res.synthetic.desc": "240 hand-written and Faker-built enquiries",
      "res.status.pending": "Pending", "res.status.mock": "Preview",
      "res.triage.title": "Reply drafting",
      "res.triage.lead": "Per backend, on the same mock test set.",
      "res.triage.note": "Local figures are placeholder rows until the local run is finished; they do not claim a completed local test.",
      "res.th.backend": "Backend", "res.th.model": "Model", "res.th.validJson": "Valid JSON",
      "res.th.category": "Category accuracy", "res.th.latency": "Median latency", "res.th.calls": "Calls",
      "res.backend.cloud": "Cloud model (BYOK)", "res.backend.local": "Local model (Ollama)",
      "res.limits.title": "What this does not catch",
      "res.limits.lead": "Known limits, shown before the numbers.",
      "res.th.limit": "Limit", "res.th.what": "What happens", "res.th.mitigation": "Mitigation",
      "res.limits.r1.l": "Names outside the list", "res.limits.r1.w": "Unusual or non-German names can stay in clear.", "res.limits.r1.m": "Salutation cues and a human check before sending.",
      "res.limits.r2.l": "Addresses without a number", "res.limits.r2.w": "A street name without a house number may not match.", "res.limits.r2.m": "Add a manual review step for address blocks.",
      "res.limits.r3.l": "Phone numbers written as words", "res.limits.r3.w": "Spelled-out digits are not detected by the browser demo.", "res.limits.r3.m": "Review the demo output; the server pipeline adds a second pass.",
      "res.limits.r4.l": "Context inference", "res.limits.r4.w": "A model can still infer sensitive facts from the situation.", "res.limits.r4.m": "Keep a human in the loop; do not treat pseudonymised text as safe to publish.",
      "res.limits.r5.l": "Scanned documents", "res.limits.r5.w": "Text inside images is not covered by this filter.", "res.limits.r5.m": "OCR and manual review before sending.",
      "res.limits.r6.l": "Legal status", "res.limits.r6.w": "Replacing data does not by itself make a processing operation lawful.", "res.limits.r6.m": "Assess purpose, legal basis and contracts separately.",
      "res.notLegal.title": "Not legal advice",
      "res.notLegal.body": "This page describes a technical filter. It is not legal advice and does not replace a review of your processing under data-protection law.",
      "res.pseudo.title": "Pseudonymisation, not anonymisation",
      "res.pseudo.body": "The filter replaces personal data with placeholders. The original values still exist in the local map and can be restored, so the result is pseudonymised, not anonymous.",

      "tech.eyebrow": "Technical details",
      "tech.title": "Collapsed, because the page should stay readable",
      "tech.lead": "Architecture, detection stack, guard, backends and the test behind the privacy claims.",
      "tech.arch.sum": "Architecture",
      "tech.arch.body": "A FastAPI service receives an enquiry, runs detection, replaces values with typed placeholders, re-scans the result, calls one AI backend, and restores the placeholders in the returned draft. n8n triggers the flow; the placeholder map stays in memory and is never written to the page data.",
      "tech.detect.sum": "Detection stack",
      "tech.detect.body": "Microsoft Presidio and spaCy handle names and organisations. Regular expressions with checksums handle emails, German phone numbers, IBANs, postcodes with city, street with number, URLs and VAT IDs. The browser demo adds a Faker de_DE first-name list and salutation cues.",
      "tech.guard.sum": "The guard",
      "tech.guard.body": "Before any AI call, a second pass compares the pseudonymised text with the values found in the original. It checks normalised originals and digit-only forms for phone numbers and IBANs. On a leak the call is blocked and the verdict names the leaked types, never the values.",
      "tech.backends.sum": "AI backends",
      "tech.backends.body": "A cloud backend through a BYOK chat-completions endpoint and a local Ollama backend behind the same interface. The page data is backend-agnostic; the results table records which backend produced each row.",
      "tech.test.sum": "No-network test for the demo",
      "tech.test.body": "The demo box above was checked with browser network logging: typing text and pressing the button made no requests. The claim covers the demo box only, not the rest of the page, which loads its JSON data once.",
      "tech.data.sum": "Test data and reporting",
      "tech.data.body": "All enquiries on this page are synthetic, built from hand-written templates and Faker de_DE values. GermEval 2014 is downloaded by a script, git-ignored, never shown and never sent to a model; only detection rates are published. Labelled misses are reported as they are.",
      "tech.repro.sum": "Reproducibility",
      "tech.repro.body": "Page data carries a mock flag, a version, a commit and a hash field. The measured run replaces the mock values; the shapes of examples.json and results.json stay the same.",

      "credits.eyebrow": "Data and credits",
      "credits.title": "What this page stands on",
      "credits.lead": "Open tools and one research dataset, with the licence and the limit of each.",
      "credits.germeval.desc": "German legal texts. Used only to compute detection rates; no sentences shown.",
      "credits.presidio.desc": "PII detection for names, organisations and more.",
      "credits.spacy.desc": "German NLP models behind Presidio.",
      "credits.faker.desc": "Synthetic German names, addresses and contact data; the de_DE first-name export powers the browser demo.",
      "credits.n8n.desc": "Workflow glue for the server pipeline.",
      "credits.ollama.desc": "Local model runtime. The model's own licence is listed in the repository.",
      "credits.assets.name": "Icons and illustrations",
      "credits.assets.desc": "Hand-drawn SVG. No icon library and no external images.",
      "credits.assets.lic": "This page",
      "credits.font.desc": "Self-hosted typeface, copied from the portfolio's other project pages.",
      "footer.built": "Built by Saber Sojudi.", "footer.legal": "Not legal advice.",
      "footer.portfolio": "Portfolio", "footer.top": "Back to top",
      "common.error": "Could not load the example data. Please open the page through a web server.",
      "common.preview": "Preview", "common.dash": "—"
    },

    de: {
      "meta.title": "AI Privacy Filter — Saber Sojudi",
      "meta.desc": "Ein Filter, der personenbezogene Daten durch Platzhalter ersetzt, bevor eine Kunden-E-Mail eine KI erreicht – und die echten Werte danach im Entwurf wiederherstellt. Demo, Ergebnisse und Grenzen.",
      "skip": "Zum Inhalt springen",
      "brand.sub": "Pseudonymisieren, bevor die KI es sieht",
      "nav.example": "Beispiel", "nav.gallery": "Galerie", "nav.try": "Ausprobieren",
      "nav.how": "So funktioniert es", "nav.results": "Ergebnisse", "nav.technical": "Details",
      "a.light": "Helles Design", "a.dark": "Dunkles Design", "a.github": "Quellcode auf GitHub ansehen",
      "a.lang": "Sprache", "a.theme": "Design", "a.sections": "Abschnitte", "a.technology": "Technologie", "a.footer": "Fußzeile",

      "hero.eyebrow": "Portfolioprojekt · Privacy Engineering",
      "hero.title": "KI für Kundenanfragen nutzen, ohne personenbezogene Daten weiterzugeben",
      "hero.lead": "Ein Filter ersetzt Namen, Adressen, IBANs und andere personenbezogene Daten durch Platzhalter, bevor eine E-Mail ein Sprachmodell erreicht – und setzt die echten Werte danach wieder in den Entwurf ein.",
      "hero.github": "Auf GitHub ansehen", "hero.try": "Ausprobieren",
      "hero.fine": "Alle Beispiele auf dieser Seite sind synthetisch. Es werden keine echten Kunden-E-Mails gezeigt.",
      "hero.card.title": "Lokal zuerst",
      "hero.card.s1.t": "Erkennen", "hero.card.s1.d": "Namen, E-Mails, Telefonnummern, IBANs",
      "hero.card.s2.t": "Ersetzen", "hero.card.s2.d": "Typisierte Platzhalter, pro Nachricht nummeriert",
      "hero.card.s3.t": "Entwerfen", "hero.card.s3.d": "Die KI schreibt mit Platzhaltern, nicht mit Personen",
      "hero.card.s4.t": "Zurücksetzen", "hero.card.s4.d": "Echte Werte kommen lokal zurück",
      "tech.python": "Python", "tech.presidio": "Presidio", "tech.fastapi": "FastAPI", "tech.n8n": "n8n",

      "demo.eyebrow": "Beispiel",
      "demo.title": "Was hineingeht, was die KI sieht, was herauskommt",
      "demo.lead": "Eine synthetische Angebotsanfrage, von Anfang bis Ende. Markierter Text sind personenbezogene Daten; die mittlere Spalte ist das, was das Modell erhält.",
      "demo.col.original": "Original", "demo.col.original.sub": "Synthetische Anfrage",
      "demo.col.ai": "Was die KI sieht", "demo.col.ai.sub": "Pseudonymisiert",
      "demo.col.final": "Fertiger Entwurf", "demo.col.final.sub": "Werte zurückgesetzt",
      "demo.foot.original": "Markiert = personenbezogene Daten",
      "demo.foot.ai": "[TYP_n] = Platzhalter",
      "demo.foot.final": "Lokal zurückgesetzt vor dem Versand",
      "demo.note": "Das Beispiel ist auf Deutsch, weil der Zielmarkt deutschsprachig ist. Die Oberfläche gibt es auf Englisch und Deutsch.",
      "mock.badge": "Vorschaudaten",
      "mock.text": "Die gemessenen Zahlen und finalen Beispiele ersetzen diese vor dem Start.",

      "stats.eyebrow": "Kennzahlen",
      "stats.title": "Was der Filter gefunden hat – und wie schnell",
      "stats.lead": "Vorschauwerte aus dem Mock-Lauf. Jede Karte erklärt, was die Zahl bedeutet.",
      "stats.note": "Vorschauwerte, in der Datendatei bereits als Mock markiert. Der gemessene Lauf ersetzt sie vor dem Start.",
      "stats.spans": "Gefundene personenbezogene Stellen",
      "stats.spans.meaning": "Über 240 synthetische Testanfragen, Doppelungen pro Stelle einmal gezählt.",
      "stats.recall": "Erkennungsrate",
      "stats.recall.meaning": "Anteil der markierten personenbezogenen Stellen, die der Filter ersetzt hat.",
      "stats.guard": "Guard-Bestätigung",
      "stats.guard.meaning": "Anteil der Nachrichten, die den erneuten Scan vor jedem KI-Aufruf bestanden.",
      "stats.latency": "Median der Gesamtzeit",
      "stats.latency.meaning": "Von der E-Mail bis zum Entwurf, lokal gemessen.",

      "gallery.eyebrow": "Beispiele",
      "gallery.title": "Fünfzehn synthetische Anfragen",
      "gallery.lead": "Nach Ton filtern. Karte öffnen und Original mit dem vergleichen, was die KI sieht. Drei markierte Lücken bleiben absichtlich sichtbar.",
      "gallery.filter": "Stil", "gallery.all": "Alle",
      "gallery.note": "Jeder Text ist synthetisch. Namen, Adressen, Telefonnummern und IBANs wurden für diese Demo erzeugt.",
      "gallery.count": "{n} von {total} Beispielen",
      "gallery.showOriginal": "Original anzeigen",
      "gallery.missed": "Markierte Lücke",
      "gallery.empty": "Keine Beispiele in diesem Stil.",
      "gallery.style.formal": "Formell", "gallery.style.informal": "Locker",
      "gallery.style.urgent": "Dringend", "gallery.style.angry": "Verärgert", "gallery.style.short": "Kurz",
      "gallery.cat.QUOTE_REQUEST": "Angebotsanfrage", "gallery.cat.SUPPORT": "Support",
      "gallery.cat.JOB_APPLICATION": "Bewerbung", "gallery.cat.PARTNERSHIP": "Partnerschaft",
      "gallery.cat.OTHER": "Sonstiges",
      "gallery.urgency.LOW": "Niedrig", "gallery.urgency.NORMAL": "Normal", "gallery.urgency.HIGH": "Hoch",

      "type.PERSON": "Person", "type.ORG": "Organisation", "type.EMAIL": "E-Mail",
      "type.PHONE": "Telefon", "type.IBAN": "IBAN", "type.ADDRESS_STREET": "Straße",
      "type.POSTCODE_CITY": "PLZ + Ort", "type.URL": "URL", "type.VAT_ID": "USt-IdNr.",
      "type.DATE_OF_BIRTH": "Geburtsdatum",
      "miss.name_not_in_list": "Name nicht in der deutschen Vornamenliste",
      "miss.street_without_number": "Straße ohne Hausnummer",
      "miss.phone_spelled_out": "Telefonnummer ausgeschrieben",

      "try.eyebrow": "Selbst ausprobieren",
      "try.title": "E-Mail einfügen und personenbezogene Daten ausblenden",
      "try.lead": "Der Filter unten läuft nur in diesem Browser-Tab. Er ist eine vereinfachte Version der Server-Pipeline.",
      "try.banner": "Vereinfachte Browserversion. Nichts, was Sie eingeben, verlässt Ihren Browser.",
      "try.label": "Ihr Text", "try.placeholder": "Kunden-E-Mail hier einfügen …",
      "try.button": "Personenbezogene Daten ausblenden", "try.sample": "Beispiel einsetzen", "try.clear": "Leeren",
      "try.inputNote": "Läuft lokal. E-Mail, deutsche Telefonnummer, IBAN mit Prüfsumme, PLZ + Ort, Straße + Hausnummer, URL, deutsche Vornamen und Anrede-Hinweise.",
      "try.resultLabel": "Was die KI sehen würde",
      "try.empty": "Das Ergebnis erscheint hier nach dem Klick.",
      "try.found": "{n} personenbezogene Angaben ersetzt",
      "try.none": "Dieser vereinfachte Filter hat keine personenbezogenen Daten gefunden.",
      "try.replaced": "Ersetzt:",
      "try.note": "Nichts wird irgendwohin gesendet. Die Box macht keine Netzwerkanfragen; sie nutzt nur die links genannten Prüfungen.",

      "how.eyebrow": "So funktioniert es",
      "how.title": "Fünf Schritte, eine Grenze",
      "how.lead": "Personenbezogene Daten werden ersetzt, bevor die Anfrage an das KI-Backend geht. Die Platzhalter-Zuordnung verlässt den lokalen Prozess nie.",
      "how.s1.t": "Erkennen", "how.s1.d": "Namen, E-Mails, IBANs",
      "how.s2.t": "Ersetzen", "how.s2.d": "durch [TYP_n]",
      "how.s3.t": "Prüfen", "how.s3.d": "vor dem Senden",
      "how.s4.t": "KI-Entwurf", "how.s4.d": "pseudonymisierter Text",
      "how.s5.t": "Zurücksetzen", "how.s5.d": "echte Werte zurück",
      "how.svgTitle": "Fünf-Schritte-Ablauf: erkennen, ersetzen, prüfen, KI-Entwurf, zurücksetzen",
      "how.legend.local": "Auf Ihrem Rechner", "how.legend.network": "Netzwerkaufruf",
      "how.note": "Schritt 4 ist der einzige, der mit einem KI-Backend spricht. Der Guard prüft den pseudonymisierten Text erneut und blockiert den Aufruf, wenn etwas übersehen wurde.",

      "res.eyebrow": "Ergebnisse und Grenzen",
      "res.title": "Zahlen mit ihren Einschränkungen",
      "res.lead": "Vorschauwerte. GermEval-Zahlen stehen noch aus; synthetische Zahlen sind Mock-Werte. Lücken werden berichtet, nicht versteckt.",
      "res.detection.title": "Erkennung",
      "res.detection.lead": "Precision, Recall und F1 auf Span-Ebene.",
      "res.detection.note": "GermEval 2014 wird nur zur Berechnung der Erkennungsraten verwendet; keine Sätze werden gezeigt.",
      "res.th.dataset": "Datensatz", "res.th.precision": "Precision", "res.th.recall": "Recall",
      "res.th.f1": "F1", "res.th.spans": "Stellen", "res.th.status": "Status",
      "res.germeval.name": "GermEval 2014 (Test)", "res.germeval.desc": "Deutsche Rechtstexte · nur Zahlen",
      "res.synthetic.name": "Synthetischer Test", "res.synthetic.desc": "240 handgeschriebene und Faker-gebaute Anfragen",
      "res.status.pending": "Ausstehend", "res.status.mock": "Vorschau",
      "res.triage.title": "Antwortentwurf",
      "res.triage.lead": "Pro Backend, auf demselben Mock-Testsatz.",
      "res.triage.note": "Lokale Werte sind Platzhalterzeilen, bis der lokale Lauf abgeschlossen ist; sie behaupten keinen abgeschlossenen lokalen Test.",
      "res.th.backend": "Backend", "res.th.model": "Modell", "res.th.validJson": "Gültiges JSON",
      "res.th.category": "Kategorie-Treffer", "res.th.latency": "Median-Latenz", "res.th.calls": "Aufrufe",
      "res.backend.cloud": "Cloud-Modell (BYOK)", "res.backend.local": "Lokales Modell (Ollama)",
      "res.limits.title": "Was das nicht erkennt",
      "res.limits.lead": "Bekannte Grenzen, vor den Zahlen.",
      "res.th.limit": "Grenze", "res.th.what": "Was passiert", "res.th.mitigation": "Gegenmaßnahme",
      "res.limits.r1.l": "Namen außerhalb der Liste", "res.limits.r1.w": "Ungewöhnliche oder nicht deutsche Namen bleiben sichtbar.", "res.limits.r1.m": "Anrede-Hinweise und eine menschliche Prüfung vor dem Versand.",
      "res.limits.r2.l": "Adressen ohne Hausnummer", "res.limits.r2.w": "Ein Straßenname ohne Nummer wird möglicherweise nicht erkannt.", "res.limits.r2.m": "Einen manuellen Prüfschritt für Adressblöcke ergänzen.",
      "res.limits.r3.l": "Telefonnummern in Worten", "res.limits.r3.w": "Ausgeschriebene Ziffern erkennt die Browser-Demo nicht.", "res.limits.r3.m": "Demo-Ausgabe prüfen; die Server-Pipeline ergänzt einen zweiten Durchlauf.",
      "res.limits.r4.l": "Kontextschluss", "res.limits.r4.w": "Ein Modell kann aus dem Zusammenhang weiterhin sensible Fakten ableiten.", "res.limits.r4.m": "Menschen im Prozess behalten; pseudonymisierten Text nicht als veröffentlichungssicher behandeln.",
      "res.limits.r5.l": "Gescannte Dokumente", "res.limits.r5.w": "Text in Bildern wird von diesem Filter nicht erfasst.", "res.limits.r5.m": "OCR und manuelle Prüfung vor dem Versand.",
      "res.limits.r6.l": "Rechtlicher Status", "res.limits.r6.w": "Das Ersetzen von Daten macht eine Verarbeitung nicht automatisch rechtmäßig.", "res.limits.r6.m": "Zweck, Rechtsgrundlage und Verträge getrennt prüfen.",
      "res.notLegal.title": "Keine Rechtsberatung",
      "res.notLegal.body": "Diese Seite beschreibt einen technischen Filter. Sie ist keine Rechtsberatung und ersetzt keine Prüfung Ihrer Verarbeitung nach Datenschutzrecht.",
      "res.pseudo.title": "Pseudonymisierung, nicht Anonymisierung",
      "res.pseudo.body": "Der Filter ersetzt personenbezogene Daten durch Platzhalter. Die Originalwerte bleiben in der lokalen Zuordnung erhalten und können wiederhergestellt werden. Das Ergebnis ist daher pseudonymisiert, nicht anonym.",

      "tech.eyebrow": "Technische Details",
      "tech.title": "Zugeklappt, damit die Seite lesbar bleibt",
      "tech.lead": "Architektur, Erkennungs-Stack, Guard, Backends und der Test hinter den Datenschutzaussagen.",
      "tech.arch.sum": "Architektur",
      "tech.arch.body": "Ein FastAPI-Dienst nimmt eine Anfrage entgegen, führt die Erkennung aus, ersetzt Werte durch typisierte Platzhalter, prüft das Ergebnis erneut, ruft ein KI-Backend auf und setzt die Platzhalter im zurückgegebenen Entwurf wieder ein. n8n stößt den Ablauf an; die Platzhalter-Zuordnung bleibt im Speicher und wird nie in die Seitendaten geschrieben.",
      "tech.detect.sum": "Erkennungs-Stack",
      "tech.detect.body": "Microsoft Presidio und spaCy erkennen Namen und Organisationen. Reguläre Ausdrücke mit Prüfsummen erkennen E-Mails, deutsche Telefonnummern, IBANs, PLZ mit Ort, Straße mit Hausnummer, URLs und USt-IdNrn. Die Browser-Demo ergänzt eine Faker-de_DE-Vornamenliste und Anrede-Hinweise.",
      "tech.guard.sum": "Der Guard",
      "tech.guard.body": "Vor jedem KI-Aufruf vergleicht ein zweiter Durchlauf den pseudonymisierten Text mit den im Original gefundenen Werten. Er prüft normalisierte Originale und reine Ziffernformen bei Telefonnummern und IBANs. Bei einem Leck wird der Aufruf blockiert; das Urteil nennt die betroffenen Typen, nie die Werte.",
      "tech.backends.sum": "KI-Backends",
      "tech.backends.body": "Ein Cloud-Backend über einen BYOK-Chat-Completions-Endpunkt und ein lokales Ollama-Backend hinter derselben Schnittstelle. Die Seitendaten sind backend-unabhängig; die Ergebnistabelle hält fest, welches Backend welche Zeile erzeugt hat.",
      "tech.test.sum": "Netzwerkfreier Test der Demo",
      "tech.test.body": "Die Demo-Box oben wurde mit Browser-Netzwerkprotokollierung geprüft: Text eingeben und den Button drücken löste keine Anfragen aus. Die Aussage gilt nur für die Demo-Box, nicht für den Rest der Seite, der seine JSON-Daten einmal lädt.",
      "tech.data.sum": "Testdaten und Berichterstattung",
      "tech.data.body": "Alle Anfragen auf dieser Seite sind synthetisch, aus handgeschriebenen Vorlagen und Faker-de_DE-Werten gebaut. GermEval 2014 wird per Skript heruntergeladen, ist git-ignoriert, wird nie gezeigt und nie an ein Modell gesendet; veröffentlicht werden nur Erkennungsraten. Markierte Lücken werden so berichtet, wie sie sind.",
      "tech.repro.sum": "Reproduzierbarkeit",
      "tech.repro.body": "Die Seitendaten tragen ein Mock-Flag, eine Version, einen Commit und ein Hash-Feld. Der gemessene Lauf ersetzt die Mock-Werte; die Form von examples.json und results.json bleibt gleich.",

      "credits.eyebrow": "Daten und Credits",
      "credits.title": "Worauf diese Seite steht",
      "credits.lead": "Offene Werkzeuge und ein Forschungsdatensatz, mit Lizenz und Grenze.",
      "credits.germeval.desc": "Deutsche Rechtstexte, nur zur Berechnung der Erkennungsraten verwendet; keine Sätze werden gezeigt.",
      "credits.presidio.desc": "PII-Erkennung für Namen, Organisationen und mehr.",
      "credits.spacy.desc": "Deutsche NLP-Modelle hinter Presidio.",
      "credits.faker.desc": "Synthetische deutsche Namen, Adressen und Kontaktdaten; der de_DE-Vornamenexport treibt die Browser-Demo.",
      "credits.n8n.desc": "Workflow-Klebstoff für die Server-Pipeline.",
      "credits.ollama.desc": "Laufzeit für lokale Modelle. Die Lizenz des jeweiligen Modells steht im Repository.",
      "credits.assets.name": "Icons und Illustrationen",
      "credits.assets.desc": "Handgezeichnetes SVG. Keine Icon-Bibliothek und keine externen Bilder.",
      "credits.assets.lic": "Diese Seite",
      "credits.font.desc": "Selbst gehostete Schrift, aus den anderen Projektseiten des Portfolios übernommen.",
      "footer.built": "Gebaut von Saber Sojudi.", "footer.legal": "Keine Rechtsberatung.",
      "footer.portfolio": "Portfolio", "footer.top": "Nach oben",
      "common.error": "Die Beispieldaten konnten nicht geladen werden. Bitte die Seite über einen Webserver öffnen.",
      "common.preview": "Vorschau", "common.dash": "—"
    }
  };

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };
  var EXAMPLES = [];
  var RESULTS = null;
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

  /* ---------- theme ---------- */
  function systemTheme() {
    try { return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; }
    catch (e) { return 'light'; }
  }
  function syncThemeButtons() {
    var current = document.documentElement.dataset.theme || systemTheme();
    $$('#theme button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.themeSet === current)); });
  }
  function setTheme(value) {
    document.documentElement.dataset.theme = value;
    try { localStorage.setItem('aipf-theme', value); } catch (e) { /* private mode */ }
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
      if (typeof m.start === 'number') all.push({ start: m.start, end: m.end, cls: 'ent miss', title: t('gallery.missed') + ': ' + t('miss.' + m.reason) });
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
    return esc(text).replace(/(\[[A-Z_]+_\d+\])/g, '<mark class="ph">$1</mark>');
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
    var ex = EXAMPLES.filter(function (x) { return x.featured; })[0] || EXAMPLES[0];

    meta.innerHTML =
      '<span class="chip chip-accent">' + esc(t('gallery.cat.' + ex.category)) + '</span>' +
      '<span class="chip">' + esc(t('gallery.style.' + ex.style)) + '</span>' +
      '<span class="chip ' + (ex.urgency === 'HIGH' ? 'chip-warn' : '') + '">' + esc(t('gallery.urgency.' + ex.urgency)) + '</span>' +
      '<span class="chip chip-warn">' + esc(t('common.preview')) + '</span>';

    var restored = findSpans(ex.reply_draft_restored || '', ex.spans || []);
    var columns = [
      {
        cls: '', title: t('demo.col.original'), sub: t('demo.col.original.sub'),
        body: '<span class="subject">' + esc(ex.subject || '') + '</span>' + marked(ex.original, ex.spans, ex.misses),
        foot: t('demo.foot.original')
      },
      {
        cls: '', title: t('demo.col.ai'), sub: t('demo.col.ai.sub'),
        body: '<span class="subject">' + esc(ex.subject || '') + '</span>' + phMarked(ex.redacted),
        foot: t('demo.foot.ai')
      },
      {
        cls: ' final', title: t('demo.col.final'), sub: t('demo.col.final.sub'),
        body: '<span class="subject">' + esc(ex.subject || '') + '</span>' + marked(ex.reply_draft_restored, restored, []),
        foot: t('demo.foot.final')
      }
    ];

    grid.innerHTML = columns.map(function (c) {
      return '<article class="demo-col' + c.cls + '">' +
        '<header><strong>' + esc(c.title) + '</strong><span>' + esc(c.sub) + '</span></header>' +
        '<div class="demo-body">' + c.body + '</div>' +
        '<div class="demo-foot">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12l4 4 10-10"/></svg>' +
        esc(c.foot) + '</div></article>';
    }).join('');

    var types = [];
    (ex.spans || []).forEach(function (s) { if (types.indexOf(s.type) === -1) types.push(s.type); });
    legend.innerHTML = types.map(function (type) {
      return '<span class="legend-item"><span class="swatch ' + entClass(type) + '"></span>' + esc(t('type.' + type)) + '</span>';
    }).join('') +
      '<span class="legend-item"><span class="swatch" style="background:var(--accent-soft);border-color:var(--accent-ring)"></span><code style="font-family:var(--mono);font-size:11px">[TYPE_n]</code></span>';
  }

  /* ---------- stats ---------- */
  function statValue(item) {
    if (item.format === 'pct1') return pct(item.value, 1);
    if (item.format === 'pct0') return pct(item.value, 0);
    if (item.format === 'dec1') return fmt(item.value, 1) + (item.unit ? ' ' + item.unit : '');
    return fmt(item.value, 0) + (item.unit ? ' ' + item.unit : '');
  }
  function renderStats() {
    var grid = $('#stats-grid');
    if (!grid || !RESULTS || !RESULTS.headline) return;
    grid.innerHTML = RESULTS.headline.map(function (item) {
      return '<article class="stat">' +
        '<span class="stat-value">' + esc(statValue(item)) + '</span>' +
        '<span class="stat-label">' + esc(t('stats.' + item.id)) + '</span>' +
        '<span class="stat-meaning">' + esc(t('stats.' + item.id + '.meaning')) + '</span>' +
        '<span class="chip chip-warn">' + esc(t('common.preview')) + '</span>' +
        '</article>';
    }).join('');
  }

  /* ---------- gallery ---------- */
  function styles() {
    var out = [];
    EXAMPLES.forEach(function (x) { if (out.indexOf(x.style) === -1) out.push(x.style); });
    return out;
  }
  function renderFilters() {
    var box = $('#gallery-filters');
    if (!box) return;
    var list = ['all'].concat(styles());
    box.innerHTML = list.map(function (s) {
      var label = s === 'all' ? t('gallery.all') : t('gallery.style.' + s);
      return '<button type="button" class="filter" data-style="' + esc(s) + '" aria-pressed="' + String(FILTER === s) + '">' + esc(label) + '</button>';
    }).join('');
    $$('.filter', box).forEach(function (b) {
      b.addEventListener('click', function () { FILTER = b.dataset.style; renderGallery(); });
    });
  }
  function renderGallery() {
    var grid = $('#gallery-grid');
    var count = $('#gallery-count');
    if (!grid) return;
    renderFilters();
    var shown = EXAMPLES.filter(function (x) { return FILTER === 'all' || x.style === FILTER; });
    if (count) count.textContent = tf('gallery.count', { n: shown.length, total: EXAMPLES.length });

    if (!shown.length) {
      grid.innerHTML = '<p class="empty">' + esc(t('gallery.empty')) + '</p>';
      return;
    }
    grid.innerHTML = shown.map(function (x) {
      var miss = (x.misses || []).length
        ? '<div class="miss-box"><strong>' + esc(t('gallery.missed')) + '</strong><ul>' +
          x.misses.map(function (m) {
            return '<li><code>' + esc(t('type.' + m.type)) + '</code> ' + esc(m.text) + ' — ' + esc(t('miss.' + m.reason)) + '</li>';
          }).join('') + '</ul></div>'
        : '';
      return '<article class="ex-card' + (miss ? ' has-miss' : '') + '">' +
        '<div class="ex-top">' +
        '<span class="chip chip-accent">' + esc(t('gallery.cat.' + x.category)) + '</span>' +
        '<span class="chip">' + esc(t('gallery.style.' + x.style)) + '</span>' +
        '<span class="chip ' + (x.urgency === 'HIGH' ? 'chip-warn' : '') + '">' + esc(t('gallery.urgency.' + x.urgency)) + '</span>' +
        (miss ? '<span class="chip chip-danger">' + esc(t('gallery.missed')) + '</span>' : '') +
        '</div>' +
        '<h3>' + esc(x.subject || '') + '</h3>' +
        '<p class="ex-red">' + phMarked(x.redacted) + '</p>' +
        '<details><summary>' + esc(t('gallery.showOriginal')) + '</summary>' +
        '<div class="ex-orig">' + marked(x.original, x.spans, x.misses) + '</div></details>' +
        miss +
        '</article>';
    }).join('');
  }

  /* ---------- results tables ---------- */
  function statusChip(kind) {
    if (kind === 'pending') return '<span class="chip chip-warn">' + esc(t('res.status.pending')) + '</span>';
    return '<span class="chip">' + esc(t('res.status.mock')) + '</span>';
  }
  function renderResults() {
    var det = $('#detection-body');
    var tri = $('#triage-body');
    var lim = $('#limits-body');
    if (!RESULTS) return;

    if (det) {
      var g = RESULTS.detection.germeval || {};
      var s = RESULTS.detection.synthetic || {};
      var row = function (name, desc, data, status) {
        var cell = function (v) { return v == null ? t('common.dash') : pct(v, 1); };
        return '<tr>' +
          '<td><strong>' + esc(name) + '</strong><br><span style="font-size:11.5px;color:var(--ink-muted)">' + esc(desc) + '</span></td>' +
          '<td class="num">' + cell(data.precision) + '</td>' +
          '<td class="num">' + cell(data.recall) + '</td>' +
          '<td class="num">' + cell(data.f1) + '</td>' +
          '<td class="num">' + (data.spans == null ? t('common.dash') : fmt(data.spans, 0)) + '</td>' +
          '<td>' + statusChip(status) + '</td>' +
          '</tr>';
      };
      det.innerHTML =
        row(t('res.germeval.name'), t('res.germeval.desc'), g, 'pending') +
        row(t('res.synthetic.name'), t('res.synthetic.desc'), s, 'mock');
    }

    if (tri) {
      tri.innerHTML = (RESULTS.triage.per_backend || []).map(function (b) {
        return '<tr>' +
          '<td><strong>' + esc(t('res.backend.' + b.name)) + '</strong></td>' +
          '<td><code style="font-family:var(--mono);font-size:11.5px">' + esc(b.model) + '</code> ' + statusChip('mock') + '</td>' +
          '<td class="num">' + pct(b.valid_json, 1) + '</td>' +
          '<td class="num">' + pct(b.category_accuracy, 1) + '</td>' +
          '<td class="num">' + fmt(b.median_latency_ms / 1000, 1) + ' s</td>' +
          '<td class="num">' + fmt(b.calls, 0) + '</td>' +
          '</tr>';
      }).join('');
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
    renderStats();
    renderGallery();
    renderResults();
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
    Promise.all([get('examples.json'), get('results.json')]).then(function (out) {
      EXAMPLES = Array.isArray(out[0]) ? out[0] : (out[0].examples || []);
      RESULTS = out[1];
      var sample = EXAMPLES.filter(function (x) { return x.style === 'informal'; })[0] || EXAMPLES[0];
      window.AIPF_SAMPLE = sample ? sample.original : '';
      renderAll();
      if (window.AIPF_TRYIT && typeof window.AIPF_TRYIT.refresh === 'function') window.AIPF_TRYIT.refresh();
    }).catch(function (err) {
      var grid = $('#demo-grid');
      if (grid) grid.innerHTML = '<p class="notice">' + esc(t('common.error')) + '</p>';
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
  load();
})();
