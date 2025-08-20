from sqlalchemy.orm import Session
from . import models, schemas

def create_calculation(db: Session, request: schemas.CalculationRequest, result: dict):
    db_calc = models.ReportCalculation(
        input_data=request.account_balances,
        output_data=result
    )
    db.add(db_calc)
    db.commit()
    db.refresh(db_calc)
    return db_calc
