from datetime import datetime
from typing import Dict, List
from . import models

def generate_sru_files(report: models.AnnualReport) -> Dict[str, str]:
    """
    Generates the content for INFO.SRU and BLANKETTER.SRU files.
    Returns a dictionary with filenames as keys and file content as values.
    """
    company = report.company

    # --- Generate INFO.SRU ---
    info_content = [
        "#DATABESKRIVNING_START",
        "#PRODUKT SRU",
        "#FILNAMN BLANKETTER.SRU",
        "#DATABESKRIVNING_SLUT",
        "#MEDIELEV_START",
        f"#ORGNR {company.orgnummer.replace('-', '')}",
        f"#NAMN {company.name}",
        "#MEDIELEV_SLUT"
    ]

    # --- Generate BLANKETTER.SRU ---
    timestamp = datetime.now().strftime("%Y%m%d %H%M%S")
    org_nr = company.orgnummer.replace('-', '')

    blanketter_content = [
        f"#BLANKETT INK2R-{report.year}",
        f"#IDENTITET {org_nr} {timestamp}"
    ]

    # This is where the real mapping from report_data to SRU fields would go.
    # We'll just add a few placeholder fields based on the simplified data.
    report_data = report.report_data or {}
    verifications = report_data.get("verifications", [])
    total_revenue = 0
    for ver in verifications:
        for t in ver.get("transactions", []):
            if t.get("kontonr", "").startswith("3"):
                total_revenue -= t.get("belopp", 0) # revenue is credit

    blanketter_content.append(f"#UPPGIFT 7000 {int(total_revenue)}") # Nettoomsättning
    blanketter_content.append(f"#UPPGIFT 7890 {int(total_revenue)}") # Placeholder for result

    blanketter_content.append("#BLANKETTSLUT")
    blanketter_content.append("#FIL_SLUT")

    return {
        "INFO.SRU": "\n".join(info_content),
        "BLANKETTER.SRU": "\n".join(blanketter_content)
    }
