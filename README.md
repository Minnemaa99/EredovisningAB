# Eredovisning

Eredovisning is a web-based service for creating and submitting annual reports and income declarations online for Swedish companies. This project is a clone of the functionality and design of `edeklarera.se`.

## Project Goal

The goal is to build a full-stack application that allows users to:
- Register an account and a company.
- Import accounting data via SIE files or manual entry.
- Validate the data according to Swedish accounting standards (K2).
- Generate a compliant annual report (Årsredovisning) as a PDF.
- Generate SRU files for the income declaration (Inkomstdeklaration).
- Download the generated documents after a payment.

## Tech Stack
- **Frontend:** Next.js (React) with TypeScript
- **Backend:** FastAPI (Python)
- **Database:** SQLite (for development), PostgreSQL (for production)
- **Migrations:** Alembic
- **Styling:** Tailwind CSS

This `README.md` will be updated with setup and deployment instructions as the project progresses.
