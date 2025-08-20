# K2 Calculation Engine API

This project is a FastAPI backend service that provides an API for calculating a K2-compliant annual report from a list of account balances. It was created to fulfill a user request for a "pure and correct calculation engine".

## Features
-   Accepts a JSON object containing account numbers and their balances.
-   Maps accounts to the standard K2 report categories (e.g., Materiella anläggningstillgångar, Nettoomsättning).
-   Calculates derived results (e.g., Rörelseresultat, Årets resultat).
-   Performs a validation check to ensure the balance sheet balances.
-   Returns a structured JSON object with the complete, calculated report.
-   Saves each calculation request and its result to a database.

## API Endpoint

### `POST /api/calculate`
-   **Request Body:**
    ```json
    {
      "account_balances": {
        "1200": 369350.0,
        "1400": 420333.0,
        "1510": 871666.0,
        "1930": 1059044.0,
        "2091": -315603.0
      }
    }
    ```
-   **Success Response (200 OK):**
    A JSON object containing the ID of the calculation, the input data, and the structured output data.

## How to Run the Server

### 1. Prerequisites
-   Python 3.10+

### 2. Installation
Navigate to the `backend` directory and install the required packages:
```bash
cd backend
pip install -r requirements.txt
```

### 3. Database Migration
Before running the server for the first time, you need to create the database schema:
```bash
# Make sure you are in the 'backend' directory
alembic upgrade head
```
This will create a `calculator.db` file in the `backend` directory.

### 4. Run the Server
Use `uvicorn` to run the FastAPI application:
```bash
# Make sure you are in the 'backend' directory
uvicorn app.main:app --reload
```

The server will start on `http://localhost:8000`. You can access the interactive API documentation (Swagger UI) at `http://localhost:8000/docs` to test the endpoint.
