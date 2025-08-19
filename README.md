# edeklarera.se

`edeklarera.se` är en digital tjänst för att förenkla och automatisera skapandet och inlämningen av årsredovisningar och inkomstdeklarationer för svenska aktiebolag. Tjänsten riktar sig till småföretagare som vill hantera sin administration digitalt, snabbt och kostnadseffektivt.

## Syfte

Målet med projektet är att erbjuda en heltäckande lösning som täcker hela flödet: från import av bokföringsdata till generering av juridiskt korrekta dokument (årsredovisning enligt K2, SRU-filer för deklaration) och vägledning för digital inlämning.

## Teknisk Struktur

Projektet är uppbyggt som en monorepo med en tydlig separation mellan frontend och backend.

-   **Frontend:** En modern webbapplikation byggd med **Next.js (React)** och **TypeScript**. Den ansvarar för användargränssnitt, interaktioner och guidning genom processen. Styling hanteras med **Tailwind CSS**.
-   **Backend:** En robust API-tjänst byggd med **FastAPI (Python)**. Den hanterar all affärslogik, datavalidering, dokumentgenerering och kommunikation med databasen.
-   **Databas:** **PostgreSQL** är den avsedda databasen för produktion. **Alembic** används för att hantera databasmigreringar. För lokal utveckling används **SQLite** för enkelhetens skull.
-   **Rapportgenerering:**
    -   **PDF (Årsredovisning):** Genereras från en HTML-mall med **WeasyPrint** och **Jinja2**.
    -   **SRU (Deklaration):** Genereras med en anpassad modul för att skapa de nödvändiga `INFO.SRU`- och `BLANKETTER.SRU`-filerna.
-   **Testning:**
    -   Backend-tester skrivs med **Pytest**.
    -   Frontend E2E-tester är avsedda att skrivas med **Playwright**.
-   **Containerisering:** Både frontend och backend har `Dockerfile`s för att bygga produktionsklara images.

## Projektstruktur

```
.
├── .github/workflows/ci.yml  # Placeholder för CI/CD
├── backend/
│   ├── alembic/              # Databasmigreringar
│   ├── app/                  # Huvudsaklig applikationskod
│   │   ├── templates/        # HTML-mallar för PDF-generering
│   │   ├── sie_parser/       # Parser för SIE-filer
│   │   ├── main.py           # FastAPI app och endpoints
│   │   ├── models.py         # SQLAlchemy-modeller
│   │   ├── schemas.py        # Pydantic-modeller
│   │   ├── crud.py           # Databaslogik
│   │   └── ...
│   ├── tests/                # Backend-tester
│   ├── Dockerfile            # Docker-konfiguration för backend
│   └── requirements.txt
└── frontend/
    ├── components/           # React-komponenter
    ├── pages/                # Next.js sidor/routes
    ├── e2e/                  # Playwright E2E-tester
    ├── Dockerfile            # Docker-konfiguration för frontend
    └── package.json
```

## Lokal Installation och Utveckling

### Förutsättningar
-   Python 3.10+
-   Node.js 18+
-   En PostgreSQL-databas (för produktionslik miljö)

### Backend Setup
1.  **Navigera till backend-mappen:**
    ```bash
    cd backend
    ```
2.  **Skapa en virtuell miljö (rekommenderas):**
    ```bash
    python -m venv venv
    source venv/bin/activate
    ```
3.  **Installera beroenden:**
    ```bash
    pip install -r requirements.txt
    pip install -r requirements-dev.txt
    ```
4.  **Konfigurera databasen:**
    -   För **SQLite** (standard för utveckling): Ingen konfiguration behövs. Databasen skapas i `backend/edeklarera.db`.
    -   För **PostgreSQL:** Ändra `sqlalchemy.url` i `alembic.ini` till din PostgreSQL-anslutningssträng.
5.  **Kör databasmigreringar:**
    ```bash
    alembic upgrade head
    ```
6.  **Starta backend-servern:**
    ```bash
    uvicorn app.main:app --reload
    ```
    API:et är nu tillgängligt på `http://localhost:8000`, och Swagger-dokumentationen på `http://localhost:8000/docs`.

### Frontend Setup
1.  **Navigera till frontend-mappen:**
    ```bash
    cd frontend
    ```
2.  **Installera beroenden:**
    ```bash
    npm install
    ```
3.  **Starta frontend-servern:**
    ```bash
    npm run dev
    ```
    Applikationen är nu tillgänglig på `http://localhost:3000`.

## Driftsättning (Deployment)

Applikationen är designad för att kunna driftsättas som två separata container-baserade tjänster (backend och frontend).

1.  **Bygg Docker-images:**
    ```bash
    # För backend
    docker build -t edeklarera-backend -f backend/Dockerfile .

    # För frontend
    docker build -t edeklarera-frontend -f frontend/Dockerfile .
    ```
2.  **Driftsättning till GCP (exempel med Cloud Run):**
    -   Publicera dina images till Google Artifact Registry.
    -   Skapa två Cloud Run-tjänster, en för `edeklarera-backend` och en för `edeklarera-frontend`.
    -   Konfigurera miljövariabler (t.ex. databas-URL, Stripe/Auth0-nycklar) i Cloud Run-tjänsterna.
    -   Sätt upp en Cloud SQL-instans för PostgreSQL-databasen och anslut backend-tjänsten till den.
    -   Konfigurera en Load Balancer för att dirigera trafik till frontend-tjänsten och hantera anrop till `/api/*` genom att skicka dem till backend-tjänsten.

---

## **Viktig Juridisk Information**

Detta projekt är en teknisk demonstration och utgör **inte** en juridiskt granskad eller godkänd lösning för att skapa eller lämna in finansiella rapporter.

-   **K2-regelverket:** De genererade rapporterna (PDF) är förenklade och uppfyller **inte** med säkerhet alla krav enligt K2-regelverket. En fullständig implementation kräver noggrann mappning av kontoplan och efterlevnad av alla formella krav.
-   **Signering & Inlämning:** Funktioner för digital signering och direktinlämning är endast platshållare. Användare måste själva ladda ner dokumenten och hantera inlämning och signering enligt gällande lagar och regler från Bolagsverket och Skatteverket.

**En fullständig juridisk och redovisningsteknisk granskning är nödvändig innan denna tjänst kan användas i ett skarpt läge.**
