from sqlalchemy import Column, Integer, JSON
from .database import Base

class ReportCalculation(Base):
    __tablename__ = "report_calculations"

    id = Column(Integer, primary_key=True, index=True)

    # Store the raw input balances
    input_data = Column(JSON, nullable=False)

    # Store the structured, calculated report
    output_data = Column(JSON, nullable=False)
