from sqlalchemy import Column, Integer, String, Date, ForeignKey, Float
from sqlalchemy.orm import relationship
from .database import Base

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    orgnummer = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    address_info = Column(String) # Simple string for now, can be expanded to a separate model

    declaration_years = relationship("DeclarationYear", back_populates="company")
    accounting_files = relationship("AccountingFile", back_populates="company")


class DeclarationYear(Base):
    __tablename__ = "declaration_years"

    id = Column(Integer, primary_key=True, index=True)
    year = Column(Integer, nullable=False)
    status = Column(String, default="new") # e.g., new, in_progress, submitted
    submission_date = Column(Date)

    company_id = Column(Integer, ForeignKey("companies.id"))
    company = relationship("Company", back_populates="declaration_years")


class AccountingFile(Base):
    __tablename__ = "accounting_files"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False)
    status = Column(String, default="uploaded") # uploaded, processing, imported, failed
    upload_date = Column(Date, nullable=False)

    company_id = Column(Integer, ForeignKey("companies.id"))
    company = relationship("Company", back_populates="accounting_files")

    transactions = relationship("Transaction", back_populates="file")


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    account = Column(String, index=True, nullable=False)
    description = Column(String)
    debit = Column(Float, default=0.0)
    credit = Column(Float, default=0.0)
    transaction_date = Column(Date)

    file_id = Column(Integer, ForeignKey("accounting_files.id"))
    file = relationship("AccountingFile", back_populates="transactions")
