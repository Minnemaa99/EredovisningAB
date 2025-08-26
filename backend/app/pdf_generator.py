import jinja2
from weasyprint import HTML
import traceback

# K2_calculator behövs inte längre här, eftersom resultaten skickas in färdigberäknade.

def create_annual_report_pdf(report_data, k2_results, is_preview: bool = False):
    """
    Genererar en PDF för en årsredovisning från ett strukturerat dataobjekt.
    Denna funktion är nu uppdaterad för att ta emot de nya argumenten.
    """
    try:
        # 1. Förbered kontext för Jinja2-templaten.
        # Vi behöver hantera två typer av report_data:
        # - Ett Pydantic-schema (schemas.DetailedReportPayload)
        # - Ett SQLAlchemy-objekt (models.AnnualReport)
        
        # hasattr kollar om objektet har en viss egenskap.
        # SQLAlchemy-objektet har 'company', Pydantic-schemat har 'company_name'.
        if hasattr(report_data, 'company'): # Detta är ett databasobjekt
            company_name = report_data.company.name
            org_nr = report_data.company.org_nr
            representatives = report_data.representatives or []
        else: # Detta är ett Pydantic-schema från frontend
            company_name = report_data.company_name
            org_nr = report_data.org_nr
            # Konvertera Pydantic-objekt till dicts för templaten
            representatives = [rep.model_dump() for rep in report_data.representatives]

        template_context = {
            "company_name": company_name,
            "org_nr": org_nr,
            "start_date": report_data.start_date,
            "end_date": report_data.end_date,
            "forvaltningsberattelse": report_data.forvaltningsberattelse or "",
            "signature_city": report_data.signature_city,
            "signature_date": report_data.signature_date,
            "representatives": representatives,
            "is_preview": is_preview,
            "k2_results": k2_results, # Använd de färdigberäknade resultaten
        }

        template_loader = jinja2.FileSystemLoader(searchpath="./app/templates")
        template_env = jinja2.Environment(loader=template_loader)
        # Lägg till en filterfunktion för att formatera nummer
        template_env.filters['format_number'] = lambda n: f"{n:,.0f}".replace(",", " ") if isinstance(n, (int, float)) else n
        template = template_env.get_template("annual_report.html")
        html_content = template.render(template_context)

        pdf_bytes = HTML(string=html_content).write_pdf()
        return pdf_bytes
    except Exception as e:
        traceback.print_exc()
        raise e
