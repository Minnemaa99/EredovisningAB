# Eredovisning - Detailed K2 Application

This project is a full-stack application for creating Swedish K2-compliant annual reports. It is a detailed implementation based on user specifications to clone the functionality of a financial reporting service.

## Core Features
- A multi-step frontend wizard for manually entering detailed data for an annual report (income statement, balance sheet, etc.).
- A detailed backend data model where each line item in the financial reports corresponds to a specific field in the database.
- A K2 calculation engine that computes derived values (e.g., various results, totals).
- A PDF generation service that creates watermarked previews and final, clean reports from the structured data.
- A robust API to support the entire creation and generation flow.

## Tech Stack
- **Frontend:** Next.js (React) with TypeScript & Tailwind CSS
- **Backend:** FastAPI (Python)
- **Database:** SQLite (dev), with automatic table creation on startup.
- **PDF Generation:** WeasyPrint + Jinja2

## How to Run the Application

### 1. Prerequisites
- Python 3.10+
- Node.js 18+

### 2. Backend Setup
1.  **Navigate to the `backend` directory.**
2.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```
3.  **Run the Server:**
    The application will automatically create the `eredovisning.db` database file and its tables on first startup.
    ```bash
    uvicorn app.main:app --reload
    ```
    The API will be available at `http://localhost:8000`.

### 3. Frontend Setup
1.  **Navigate to the `frontend` directory (in a new terminal).**
2.  **Install dependencies:**
    ```bash
    npm install
    ```
3.  **Run the frontend development server:**
    The Next.js app is configured with a proxy, so API calls will be automatically routed to the backend.
    ```bash
    npm run dev
    ```
    The web application will be available at `http://localhost:3000`. The wizard for creating a new report is at `http://localhost:3000/arsredovisning/ny`.
