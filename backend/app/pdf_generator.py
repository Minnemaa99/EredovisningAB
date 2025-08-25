from jinja2 import Environment, FileSystemLoader
from weasyprint import HTML
from io import BytesIO
import os

def create_annual_report_pdf(
    company_name: str,
    org_nr: str,
    start_date,
    end_date,
    forvaltningsberattelse: str,
    signature_city: str,
    signature_date,
    representatives_data: list,
    k2_results: dict,
    is_preview: bool = False
) -> BytesIO:
    """
    Generates a PDF annual report from a Jinja2 template.
    Now includes a preview flag.
    """
    # Set up Jinja2 environment
    template_dir = os.path.join(os.path.dirname(__file__), 'templates')
    env = Environment(loader=FileSystemLoader(template_dir))
    template = env.get_template('annual_report.html')

    # Prepare the context dictionary with all the data for the template
    context = {
        "company_name": company_name,
        "org_nr": org_nr,
        "start_date": start_date,
        "end_date": end_date,
        "forvaltningsberattelse": forvaltningsberattelse,
        "signature_city": signature_city,
        "signature_date": signature_date,
        "representatives": representatives_data,
        "k2_results": k2_results,
        "is_preview": is_preview
    }

    # Render the HTML template with the context
    html_out = template.render(context)

    # Create PDF from HTML
    pdf_buffer = BytesIO()
    HTML(string=html_out).write_pdf(pdf_buffer)
    pdf_buffer.seek(0)

    return pdf_buffer
