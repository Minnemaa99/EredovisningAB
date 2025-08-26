import jinja2
from weasyprint import HTML
import traceback

from . import k2_calculator

def create_annual_report_pdf(report, is_preview: bool = False):
    """
    Genererar en PDF för en årsredovisning från ett databasobjekt.
    """
    try:
        # 1. Hämta rådata från rapportobjektet
        accounts_data_dict = report.accounts_data
        current_year_accounts = accounts_data_dict.get('current_year', [])
        previous_year_accounts = accounts_data_dict.get('previous_year', [])

        # 2. Anropa den centrala kalkylatorn för att få den nästlade strukturen
        structured_results = k2_calculator.get_structured_k2_results(current_year_accounts, previous_year_accounts)

        # 3. Förbered kontext för Jinja2-templaten
        template_context = {
            "company_name": report.company.name,
            "org_nr": report.company.org_nr,
            "start_date": report.start_date,
            "end_date": report.end_date,
            "forvaltningsberattelse": report.forvaltningsberattelse or "",
            "signature_city": report.signature_city,
            "signature_date": report.signature_date,
            "representatives": report.representatives or [],
            "is_preview": is_preview,
            "k2_results": structured_results, # Skicka den nästlade strukturen direkt
        }

        template_loader = jinja2.FileSystemLoader(searchpath="./app/templates")
        template_env = jinja2.Environment(loader=template_loader)
        # Lägg till en filterfunktion för att formatera nummer
        template_env.filters['format_number'] = lambda n: f"{n:,.0f}".replace(",", " ")
        template = template_env.get_template("annual_report.html")
        html_content = template.render(template_context)

        pdf_bytes = HTML(string=html_content).write_pdf()
        return pdf_bytes
    except Exception as e:
        traceback.print_exc()
        raise e
