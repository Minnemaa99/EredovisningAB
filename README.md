# Eredovisning

Eredovisning is a web-based service for creating and submitting annual reports and income declarations online for Swedish companies. This project is a clone of the functionality and design of `edeklarera.se`.

## Tech Stack

-   **Frontend:** Next.js (React) with TypeScript & Tailwind CSS.
-   **Backend:** FastAPI (Python).
-   **Database:** SQLite for local development, with support for PostgreSQL in production.
-   **Migrations:** Alembic.
-   **PDF Generation:** WeasyPrint.
-   **SRU Generation:** Custom module.

## Project Structure

The project is a monorepo with two main packages:

```
.
├── backend/
│   ├── alembic/
│   ├── app/
│   │   ├── templates/
│   │   ├── sie_parser/
│   │   └── ...
│   ├── Dockerfile
│   └── requirements.txt
└── frontend/
    ├── components/
    │   └── wizard/
    ├── pages/
    ├── Dockerfile
    └── package.json
```

## Local Installation and Development

Follow these steps to get the project running on your local machine.

### Prerequisites
-   Python 3.10+
-   Node.js 18+

### 1. Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd backend
    ```

2.  **Create a virtual environment (recommended):**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Set up and migrate the database:**
    The project uses a local SQLite database (`eredovisning.db`) by default. The migration tool Alembic needs to be initialized and run.
    ```bash
    alembic upgrade head
    ```

5.  **Run the backend server:**
    ```bash
    uvicorn app.main:app --reload
    ```
    The API will be available at `http://localhost:8000`. You can view the interactive API documentation at `http://localhost:8000/docs`.

### 2. Frontend Setup

1.  **Navigate to the frontend directory (in a new terminal):**
    ```bash
    cd frontend
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the frontend development server:**
    ```bash
    npm run dev
    ```
    The web application will be available at `http://localhost:3000`.

## Legal Disclaimer

This project is a technical clone for demonstration purposes. It is **not** a legally compliant tool for financial reporting. The generated documents do not guarantee compliance with K2 regulations or Skatteverket's requirements. A full legal and accounting review would be necessary before using this application for real financial submissions.
