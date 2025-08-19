from datetime import datetime
from typing import Dict, List, Tuple
from . import models

def generate_sru(company: models.Company, transactions: List[models.Transaction]) -> Dict[str, str]:
    """
    Generates the content for INFO.SRU and BLANKETTER.SRU files.
    Returns a dictionary with filenames as keys and file content as values.
    """

    # --- Generate INFO.SRU ---
    info_content = generate_info_sru(company)

    # --- Generate BLANKETTER.SRU ---
    blanketter_content = generate_blanketter_sru(company, transactions)

    return {
        "INFO.SRU": info_content,
        "BLANKETTER.SRU": blanketter_content
    }

def generate_info_sru(company: models.Company) -> str:
    """Generates the content for the INFO.SRU file."""
    lines = [
        "#DATABESKRIVNING_START",
        "#PRODUKT SRU",
        "#FILNAMN BLANKETTER.SRU",
        "#DATABESKRIVNING_SLUT",
        "#MEDIELEV_START",
        f"#ORGNR {company.orgnummer.replace('-', '')}",
        f"#NAMN {company.name}",
        # Placeholders for other required fields
        f"#ADRESS {company.address_info or ''}",
        f"#POSTNR 12345",
        f"#POSTORT STOCKHOLM",
        f"#EMAIL foretag@example.com",
        "#MEDIELEV_SLUT"
    ]
    return "\n".join(lines)

def generate_blanketter_sru(company: models.Company, transactions: List[models.Transaction]) -> str:
    """
    Generates the content for the BLANKETTER.SRU file.
    This is a major simplification. The real implementation would need the correct
    SRU codes for each field in the Inkomstdeklaration 2 form.
    """
    timestamp = datetime.now().strftime("%Y%m%d %H%M%S")
    org_nr = company.orgnummer.replace('-', '')

    lines = []

    # Start of the INK2 form
    lines.append("#BLANKETT INK2R-2023") # Example form name
    lines.append(f"#IDENTITET {org_nr} {timestamp}")

    # --- Simplified data mapping ---
    # This is where you would map your accounting data to SRU codes.
    # Example: SRU code 7000 for "Nettoomsättning" (Net sales)

    # Calculate total sales (e.g., from accounts 3000-3999)
    net_sales = sum(t.credit for t in transactions if t.account.startswith('3'))

    # The SRU format doesn't use decimals, so amounts are multiplied by 100.
    # However, for simplicity, we'll use integers here.
    lines.append(f"#UPPGIFT 7000 {int(net_sales)}")

    # Placeholder for other fields
    lines.append("#UPPGIFT 7150 1000") # Warehouses, etc.
    lines.append("#UPPGIFT 7280 500")  # Other operating expenses

    # Calculate a simple result
    result = net_sales - 1000 - 500
    lines.append(f"#UPPGIFT 7890 {int(result)}") # Result before tax

    lines.append("#BLANKETTSLUT")
    lines.append("#FIL_SLUT")

    return "\n".join(lines)
