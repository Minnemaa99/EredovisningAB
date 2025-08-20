from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict

from . import crud, models, schemas, k2_calculator
from .database import SessionLocal, engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="K2 Calculation Engine API")

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.post("/api/calculate", response_model=schemas.CalculationResponse)
def calculate_report(request: schemas.CalculationRequest, db: Session = Depends(get_db)):
    """
    Accepts a dictionary of account balances and returns a calculated K2 report.
    """
    # 1. Call the calculation engine
    calculated_data = k2_calculator.calculate_k2_report(request.account_balances)

    # 2. Save the request and result to the database
    db_record = crud.create_calculation(db=db, request=request, result=calculated_data)

    # 3. Return the full record including the ID
    return db_record

@app.get("/")
def read_root():
    return {"message": "Welcome to the K2 Calculation Engine API"}
