# ClinSutra UI/UX Prototype

A runnable React + Vite frontend inspired by the ClinSutra SIH concept.

## Run
1. Install Node.js 18+.
2. Extract the ZIP.
3. Open a terminal in the project folder.
4. Run:
   npm install
   npm run dev
5. Open the local URL shown by Vite.

## Included flows
Welcome → Language → Consent → Voice/Touch symptom input → AI initial summary → Adaptive questions → Document upload/OCR demo → AYUSH mode → Safety review → Doctor-ready summary → Doctor dashboard → Patient detail → ABHA/ABDM demo → Multilingual demo.

## Important
This is a functional frontend prototype. Browser speech recognition is used when available. OCR, LLM/medical NLP, Bhashini/Whisper, PostgreSQL, FHIR/ABDM APIs and production security are represented by demo/prototype flows and are NOT implemented as production medical integrations.

For SIH, describe the AI as assisting case-taking, summarization and red-flag identification for clinician review; it does not replace diagnosis or clinician judgment.
