from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML
from . import models
import traceback

class PDFGenerationError(Exception):
    def __init__(self, message, stage, original_exception=None):
        super().__init__(message)
        self.stage = stage
        self.original_exception = original_exception

def generate_annual_report_pdf(report: models.AnnualReport) -> bytes:
    """
    Generates a PDF for the annual report based on an HTML template.
    """
    try:
        # STAGE 1: Data Processing
        income_statement = {}
        balance_sheet = {}
        report_data = report.report_data or {}
        verifications = report_data.get("verifications", [])

        for ver in verifications:
            for t in ver.get("transactions", []):
                account_num_str = t.get("kontonr", t.get("account", "0"))
                account_num = int(account_num_str)
                amount = float(t.get("belopp") or t.get("debit") or 0.0) - float(t.get("credit") or 0.0)
                if 3000 <= account_num <= 8999:
                    income_statement[account_num_str] = income_statement.get(account_num_str, 0) + amount
                elif 1000 <= account_num <= 2999:
                    balance_sheet[account_num_str] = balance_sheet.get(account_num_str, 0) + amount

        final_result = -sum(income_statement.values())
    except Exception as e:
        raise PDFGenerationError("Data Processing Failed", stage="data_processing", original_exception=e)

    try:
        # STAGE 2: Template Rendering
        env = Environment(loader=FileSystemLoader('backend/app/templates/'))
        template = env.get_template('annual_report.html')
        context = {
            "report": report,
            "company": report.company,
            "income_statement": income_statement,
            "balance_sheet": balance_sheet,
            "final_result": final_result
        }
        html_string = template.render(context)
    except Exception as e:
        raise PDFGenerationError("Template Rendering Failed", stage="template_rendering", original_exception=e)

    try:
        # STAGE 3: PDF Conversion
        pdf_bytes = HTML(string=html_string).write_pdf()
    except Exception as e:
        raise PDFGenerationError("PDF Conversion Failed", stage="pdf_conversion", original_exception=e)

    return pdf_bytes
