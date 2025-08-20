from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML
from . import models

def generate_annual_report_pdf(report: models.AnnualReport) -> bytes:
    """
    Generates a PDF for the annual report based on an HTML template.
    """
    # The path should be relative to the directory where the server is run (the `backend` directory)
    env = Environment(loader=FileSystemLoader('app/templates/'))
    template = env.get_template('annual_report.html')

    # Data Processing
    income_statement = {}
    balance_sheet = {}
    report_data = report.report_data or {}
    verifications = report_data.get("verifications", [])

    for ver in verifications:
        for t in ver.get("transactions", []):
            account_num_str = t.get("kontonr", t.get("account", "0"))
            try:
                account_num = int(account_num_str)
                amount = float(t.get("belopp") or t.get("debit") or 0.0) - float(t.get("credit") or 0.0)

                if 3000 <= account_num <= 8999:
                    income_statement[account_num_str] = income_statement.get(account_num_str, 0) + amount
                elif 1000 <= account_num <= 2999:
                    balance_sheet[account_num_str] = balance_sheet.get(account_num_str, 0) + amount
            except (ValueError, TypeError):
                continue

    final_result = -sum(income_statement.values())

    # Template Rendering
    context = {
        "report": report,
        "company": report.company,
        "income_statement": income_statement,
        "balance_sheet": balance_sheet,
        "final_result": final_result
    }
    html_string = template.render(context)

    # PDF Conversion
    pdf_bytes = HTML(string=html_string).write_pdf()

    return pdf_bytes
