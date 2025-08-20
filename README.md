# Eredovisning (Clone Project)

This project is a full-stack clone of the Swedish financial reporting website `edeklarera.se`. The goal is to replicate the core functionality, allowing users to create and download annual reports (`Årsredovisning`) and tax declaration files (`SRU`).

## Key Features to be Implemented
- A multi-step wizard for data entry.
- Data import via SIE files.
- Manual data entry for income statements and balance sheets.
- K2-compliant calculations.
- PDF generation with watermarked previews.
- Placeholder payment and download flow.

## Tech Stack
- **Frontend:** Next.js (React) with TypeScript & Tailwind CSS
- **Backend:** FastAPI (Python)
- **Database:** SQLite (dev) / PostgreSQL (prod)
- **Migrations:** Alembic
- **PDF Generation:** WeasyPrint + Jinja2
