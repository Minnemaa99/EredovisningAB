import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app, get_db
from app.database import Base
from app import models # Ensure models are imported so Base metadata is populated

# Use an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

# Apply the override for the get_db dependency
app.dependency_overrides[get_db] = override_get_db

@pytest.fixture(scope="function")
def client():
    # Debugging: print the tables known to Base.metadata
    print("Tables in metadata before create_all:", Base.metadata.tables.keys())

    # Create tables before each test
    Base.metadata.create_all(bind=engine)

    print("Tables created.")

    with TestClient(app) as c:
        yield c

    print("Dropping tables.")
    # Drop tables after each test
    Base.metadata.drop_all(bind=engine)
