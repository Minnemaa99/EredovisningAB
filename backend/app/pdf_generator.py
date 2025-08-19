from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML
from . import models

def generate_annual_report_pdf(company: models.Company, accounting_file: models.AccountingFile) -> bytes:
    """
    Generates a PDF for the annual report based on an HTML template.
    """
    # 1. Set up Jinja2 environment
    env = Environment(loader=FileSystemLoader('backend/app/templates/'))
    template = env.get_template('annual_report.html')

    # 2. Process data for the report (simplified logic)
    # This is a major simplification. A real implementation would need
    # a proper chart of accounts (kontoplan) and logic to map accounts
    # to the correct lines in the report according to K2 rules.

    income_statement = {}
    balance_sheet = {}

    for t in accounting_file.transactions:
        account_num = int(t.account)
        amount = t.debit - t.credit

        # Income statement accounts (Resultaträkning) - typically 3000-8999
        if 3000 <= account_num <= 8999:
            income_statement[t.account] = income_statement.get(t.account, 0) + amount
        # Balance sheet accounts (Balansräkning) - typically 1000-2999
        elif 1000 <= account_num <= 2999:
            balance_sheet[t.account] = balance_sheet.get(t.account, 0) + amount

    income_statement_total = sum(income_statement.values())
    balance_sheet_total = sum(balance_sheet.values())

    # 3. Prepare context for the template
    context = {
        "company": company,
        "year": accounting_file.upload_date.year,
        "income_statement": income_statement,
        "balance_sheet": balance_sheet,
        "income_statement_total": income_statement_total,
        "balance_sheet_total": balance_sheet_total
    }

    # 4. Render the HTML template
    html_string = template.render(context)

    # 5. Generate PDF from HTML
    # WeasyPrint can take a string of HTML directly
    pdf_bytes = HTML(string=html_string).write_pdf()

    return pdf_bytes
