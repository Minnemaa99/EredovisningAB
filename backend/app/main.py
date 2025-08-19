from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from . import crud, models, schemas
from .database import SessionLocal, engine

# This line is not strictly necessary with Alembic, but can be useful for development
# if you are not using migrations for everything.
# models.Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="edeklarera.se API",
    description="API för att hantera årsredovisningar och deklarationer.",
    version="0.1.0",
)

# Dependency to get a DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/companies/", response_model=schemas.Company)
def create_company(company: schemas.CompanyCreate, db: Session = Depends(get_db)):
    db_company = crud.get_company_by_orgnummer(db, orgnummer=company.orgnummer)
    if db_company:
        raise HTTPException(status_code=400, detail="Company with this orgnummer already registered")
    return crud.create_company(db=db, company=company)

from . import security

@app.get("/companies/", response_model=List[schemas.Company])
def read_companies(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user: dict = Depends(security.get_current_user)):
    # The `current_user` dependency will ensure this endpoint is protected.
    # In a real app, you might use the user's ID to filter companies.
    companies = crud.get_companies(db, skip=skip, limit=limit)
    return companies

@app.get("/companies/{company_id}", response_model=schemas.Company)
def read_company(company_id: int, db: Session = Depends(get_db)):
    db_company = crud.get_company(db, company_id=company_id)
    if db_company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    return db_company

from fastapi import File, UploadFile
from datetime import date
from .sie_parser.sie_parse import SieParser
import io

@app.post("/api/import/{company_id}", response_model=schemas.AccountingFile)
async def import_sie_file(company_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    # 1. Check if company exists
    db_company = crud.get_company(db, company_id=company_id)
    if not db_company:
        raise HTTPException(status_code=404, detail="Company not found")

    # 2. Create an AccountingFile record
    accounting_file = crud.create_accounting_file(
        db=db,
        file=schemas.AccountingFileCreate(
            filename=file.filename,
            upload_date=date.today(),
            status="processing"
        ),
        company_id=company_id
    )

    # 3. Read and parse the file
    try:
        # The parser expects a list of lines.
        content_bytes = await file.read()
        # The SIE format often uses cp437 encoding
        content = content_bytes.decode('cp437')
        lines = content.splitlines()

        parser = SieParser(file_contents=lines)
        parser.parse()

        sie_data = parser.result
        transactions_to_create = []

        # #VER contains a list of verifications (verifikationer)
        verifications = sie_data.get_data('#VER')
        for ver in verifications:
            for trans in ver.trans_list:
                # Convert parser's Transaction to our DB schema's TransactionCreate
                debit = 0.0
                credit = 0.0
                if trans.belopp > 0:
                    debit = trans.belopp
                else:
                    credit = -trans.belopp

                trans_date = trans.transdat.date if trans.transdat.has_date else ver.verdatum.date

                transactions_to_create.append(schemas.TransactionCreate(
                    account=trans.kontonr,
                    description=trans.transtext,
                    debit=debit,
                    credit=credit,
                    transaction_date=trans_date
                ))

        # 4. Bulk insert transactions
        crud.create_transactions_bulk(db, transactions=transactions_to_create, file_id=accounting_file.id)

        # 5. Update file status
        accounting_file.status = "imported"
        db.commit()
        db.refresh(accounting_file)

    except Exception as e:
        # If anything goes wrong, mark the file as failed
        accounting_file.status = "failed"
        db.commit()
        raise HTTPException(status_code=500, detail=f"Failed to parse or import SIE file: {e}")

    return accounting_file


from fastapi.responses import StreamingResponse
from . import pdf_generator

@app.get("/api/generate/report/{file_id}")
def generate_report(file_id: int, db: Session = Depends(get_db)):
    # Fetch the accounting file and related data
    accounting_file = db.query(models.AccountingFile).filter(models.AccountingFile.id == file_id).first()
    if not accounting_file:
        raise HTTPException(status_code=404, detail="Accounting file not found")

    # The relationships should be loaded automatically if accessed.
    # For more complex scenarios, you might want to use joined loading.
    company = accounting_file.company

    # Generate the PDF
    try:
        pdf_bytes = pdf_generator.generate_annual_report_pdf(company, accounting_file)

        # Return the PDF as a streaming response
        return StreamingResponse(
            io.BytesIO(pdf_bytes),
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=arsredovisning_{company.orgnummer}.pdf"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF: {e}")


import zipfile
from . import sru_generator

@app.get("/api/export/sru/{file_id}")
def export_sru_files(file_id: int, db: Session = Depends(get_db)):
    # Fetch the accounting file and related data
    accounting_file = db.query(models.AccountingFile).filter(models.AccountingFile.id == file_id).first()
    if not accounting_file:
        raise HTTPException(status_code=404, detail="Accounting file not found")

    company = accounting_file.company
    transactions = accounting_file.transactions

    # Generate SRU file content
    try:
        sru_files = sru_generator.generate_sru(company, transactions)

        # Create a zip archive in memory
        zip_buffer = io.BytesIO()
        with zipfile.ZipFile(zip_buffer, "a", zipfile.ZIP_DEFLATED, False) as zip_file:
            for filename, content in sru_files.items():
                zip_file.writestr(filename, content)

        zip_buffer.seek(0)

        # Return the zip file
        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={"Content-Disposition": f"attachment; filename=SRU_{company.orgnummer}.zip"}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate SRU files: {e}")


import stripe

# This should be set via environment variables in a real application
stripe.api_key = "sk_test_..." # Dummy key

@app.post("/api/pay/{file_id}")
def create_payment_session(file_id: int, db: Session = Depends(get_db)):
    """
    This is a placeholder for creating a Stripe Checkout session.
    """
    # In a real implementation, you would create a Product and Price in Stripe
    # and use them to create a Checkout Session.
    # https://stripe.com/docs/api/checkout/sessions/create

    # 1. Fetch the company/file details to get amount, currency, etc.
    # 2. Create a Stripe Checkout session

    # We will simulate the response from the Stripe API
    fake_checkout_session = {
        "id": "cs_test_a1B2c3D4e5F6g7H8",
        "object": "checkout.session",
        "url": "https://checkout.stripe.com/c/pay/cs_test_a1B2c3D4e5F6g7H8#fidkd...",
    }

    return {"checkout_url": fake_checkout_session["url"]}


@app.post("/api/validate/{file_id}")
def validate_accounting_data(file_id: int, db: Session = Depends(get_db)):
    # Placeholder for validation logic
    # e.g., check if sum of debits equals sum of credits
    return {"file_id": file_id, "status": "validated", "errors": []}


@app.get("/")
def read_root():
    return {"message": "Välkommen till edeklarera.se API. Gå till /docs för att se API-dokumentationen."}
