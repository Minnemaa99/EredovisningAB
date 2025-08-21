from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML
from . import models
from .k2_calculator import perform_calculations

def generate_pdf(report: models.AnnualReport, is_preview: bool) -> bytes:
    """
    Generates the annual report PDF.
    - is_preview: If True, adds a watermark and hides the org number.
    """
    env = Environment(loader=FileSystemLoader('app/templates/'))
    template = env.get_template('annual_report.html')

    # 1. Perform calculations on the report data
    report = perform_calculations(report)

    # 2. Re-structure the calculated data to match the template's expectations
    # This is a bridge between the new calculation logic and the existing template.
    calculated_data = {
        "income_statement": {
            "Nettoomsattning": report.is_nettoomsattning,
            "Forandring_lager": report.is_forandring_lager,
            "Ovriga_rorelseintakter": report.is_ovriga_rorelseintakter,
            "Kostnad_ravaror": report.is_kostnad_ravaror,
            "Kostnad_externa": report.is_kostnad_externa,
            "Kostnad_personal": report.is_kostnad_personal,
            "Avskrivningar": report.is_avskrivningar,
            "Finansiella_intakter": report.is_finansiella_intakter,
            "Finansiella_kostnader": report.is_finansiella_kostnader,
            "Bokslutsdispositioner": report.is_bokslutsdispositioner,
            "Skatt": report.is_skatt,
            "Arets resultat": report.bs_arets_resultat_ek,
        },
        "balance_sheet": {
            "Materiella anlaggningstillgangar": report.bs_materiella_anlaggningstillgangar,
            "Finansiella anlaggningstillgangar": report.bs_finansiella_anlaggningstillgangar,
            "Varulager_mm": report.bs_varulager,
            "Kortfristiga fordringar": report.bs_kundfordringar, # Note: Simplified mapping
            "Kortfristiga placeringar": 0, # Placeholder, not in model
            "Kassa och bank": report.bs_kassa_bank,
            "Bundet eget kapital": report.bs_bundet_eget_kapital,
            "Fritt eget kapital": report.bs_fritt_eget_kapital,
            "Arets resultat": report.bs_arets_resultat_ek,
            "Obeskattade reserver": report.bs_obeskattade_reserver,
            "Langfristiga skulder": report.bs_langfristiga_skulder,
            "Kortfristiga skulder": report.bs_kortfristiga_skulder,
        }
    }

    # Calculate totals for the template
    bs = calculated_data["balance_sheet"]
    assets = (bs.get("Materiella anlaggningstillgangar", 0) +
              bs.get("Finansiella anlaggningstillgangar", 0) +
              bs.get("Varulager_mm", 0) +
              bs.get("Kortfristiga fordringar", 0) +
              bs.get("Kortfristiga placeringar", 0) +
              bs.get("Kassa och bank", 0))

    equity_and_liabilities = (bs.get("Bundet eget kapital", 0) +
                              bs.get("Fritt eget kapital", 0) +
                              bs.get("Arets resultat", 0) +
                              bs.get("Obeskattade reserver", 0) +
                              bs.get("Langfristiga skulder", 0) +
                              bs.get("Kortfristiga skulder", 0))

    calculated_data["totals"] = {
        "assets": assets,
        "equity_and_liabilities": equity_and_liabilities
    }


    # 3. Prepare context for the template
    context = {
        "report": report,
        "company": report.company,
        "is_preview": is_preview,
        "calculated": calculated_data
    }

    # 4. Render HTML
    html_string = template.render(context)

    # 5. Generate PDF
    return HTML(string=html_string).write_pdf()
