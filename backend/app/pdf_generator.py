from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML
from . import models

def generate_annual_report_pdf(report: models.AnnualReport) -> bytes:
    """
    Generates a PDF for the annual report based on an HTML template.
    """
    env = Environment(loader=FileSystemLoader('backend/app/templates/'))
    template = env.get_template('annual_report.html')

    # --- Simplified data processing ---
    # This logic would be much more complex in a real K2-compliant report.
    income_statement = {}
    balance_sheet = {}

    report_data = report.report_data or {}
    verifications = report_data.get("verifications", [])

    for ver in verifications:
        for t in ver.get("transactions", []):
            account_num_str = t.get("kontonr", "0")
            try:
                account_num = int(account_num_str)
                amount = float(t.get("belopp", 0.0))

                # Income statement accounts (3000-8999)
                if 3000 <= account_num <= 8999:
                    income_statement[account_num_str] = income_statement.get(account_num_str, 0) + amount
                # Balance sheet accounts (1000-2999)
                elif 1000 <= account_num <= 2999:
                    balance_sheet[account_num_str] = balance_sheet.get(account_num_str, 0) + amount
            except (ValueError, TypeError):
                # Skip transactions with invalid data
                continue

    # Result is the sum of all income/expense accounts
    final_result = -sum(income_statement.values()) # Incomes are credits (negative), expenses are debits (positive)

    # In a real balance sheet, Equity would be adjusted by the final_result
    # For simplicity, we just show the accounts.

    context = {
        "report": report,
        "company": report.company,
        "income_statement": income_statement,
        "balance_sheet": balance_sheet,
        "final_result": final_result
    }

    html_string = template.render(context)
    pdf_bytes = HTML(string=html_string).write_pdf()

    return pdf_bytes
