from pydantic import BaseModel
from typing import Dict, Any

class CalculationRequest(BaseModel):
    account_balances: Dict[str, float]

class CalculationResponse(BaseModel):
    id: int
    input_data: Dict[str, Any]
    output_data: Dict[str, Any]

    class Config:
        orm_mode = True
