from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML
from . import models
from .k2_calculator import calculate_k2_report

def generate_pdf(report: models.AnnualReport, is_preview: bool) -> bytes:
    """
    Generates the annual report PDF.
    - is_preview: If True, adds a watermark and hides the org number.
    """
    env = Environment(loader=FileSystemLoader('app/templates/'))
    template = env.get_template('annual_report.html')

    # 1. Get the raw account lines from the DB model
    account_lines = report.account_lines

    # 2. Use the K2 calculator to process the data
    # We need to format the input for the calculator
    input_balances = {line.account_number: line.balance_current_year for line in account_lines}
    calculated_data = calculate_k2_report(input_balances)

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
        "equity_and_liabilities": -equity_and_liabilities # Invert sign for presentation
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
