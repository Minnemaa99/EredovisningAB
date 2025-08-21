# Eredovisning - Full Application Clone

This project is a full-stack clone of the Swedish financial reporting website `edeklarera.se`. The goal is to replicate the core functionality, allowing users to create and download annual reports (`Årsredovisning`) and tax declaration files (`SRU`).

## Core Features
- A multi-step wizard for manually entering financial data for an annual report.
- A detailed data model for storing company information, report data, and settings.
- A K2-compliant calculation engine for processing financial data.
- PDF generation with watermarked previews for drafts and clean final versions.
- Placeholder API endpoints for SIE import and payment processing.

## Tech Stack
- **Frontend:** Next.js (React) with TypeScript & Tailwind CSS
- **Backend:** FastAPI (Python)
- **Database:** SQLite (for development), with code compatible with PostgreSQL.
- **PDF Generation:** WeasyPrint + Jinja2
- **Calculations:** Custom K2 calculation module.

## How to Run the Application

### 1. Prerequisites
- Python 3.10+
- Node.js 18+

### 2. Backend Setup
1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```
2.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
3.  **Run the Server:**
    The application is configured to automatically create the necessary SQLite database (`eredovisning.db`) and its tables on startup.
    ```bash
    uvicorn app.main:app --reload
    ```
    The API will be available at `http://localhost:8000`.

### 3. Frontend Setup
1.  **Navigate to the frontend directory (in a new terminal):**
    ```bash
    cd frontend
    ```
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the frontend development server:**
    The Next.js app is configured to proxy API requests to the backend.
    ```bash
    npm run dev
    ```
    The web application will be available at `http://localhost:3000`. To start the annual report creation process, navigate to `http://localhost:3000/arsredovisning/ny`.

## Legal Disclaimer
This project is a technical clone for demonstration purposes. It is **not** a legally compliant tool for financial reporting. The generated documents do not guarantee compliance with K2 regulations or Skatteverket's requirements. A full legal and accounting review would be necessary before using this application for real financial submissions.
