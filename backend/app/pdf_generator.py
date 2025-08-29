from weasyprint import HTML
from jinja2 import Template, Environment
import os
import traceback

# Skapa Jinja2 Environment och lägg till anpassade filter
env = Environment()

def format_number(value, *args, **kwargs):
    """
    Formaterar ett nummer enligt svenska standarder:
    - Mellanslag som tusentalsavgränsare
    - Komma för decimaler
    - Hanterar negativa värden och None
    - Ignorerar extra argument från Jinja2
    """
    if value is None or value == 0:
        return "0"
    
    try:
        # Om det är ett float med decimaler, visa 2 decimaler
        if isinstance(value, float) and value % 1 != 0:
            # Formatera med komma som decimalavgränsare och mellanslag som tusentals
            formatted = f"{value:,.2f}".replace(",", " ").replace(".", ",")
            return formatted
        else:
            # För heltal, använd mellanslag som tusentalsavgränsare
            formatted = f"{int(value):,}".replace(",", " ")
            return formatted
    except (ValueError, TypeError):
        return str(value)

# Registrera filtret i Environment
env.filters['format_number'] = format_number

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
            # KORRIGERING: Hämta not-datan från databasobjektets 'notes'-fält.
            notes_data = report_data.notes or {}
            # NYTT: Hämta flerarsOversikt från databasobjektet
            flerarsOversikt = report_data.flerarsOversikt or []
        else: # Detta är ett Pydantic-schema från frontend
            company_name = report_data.company_name
            org_nr = report_data.org_nr
            # Konvertera Pydantic-objekt till dicts för templaten
            representatives = [rep.model_dump() for rep in report_data.representatives]
            # KORRIGERING: Hämta not-datan från Pydantic-schemats 'notes_data'-fält.
            notes_data = report_data.notes_data or {}
            # NYTT: Hämta flerarsOversikt från Pydantic-schema
            flerarsOversikt = [year.model_dump() for year in report_data.flerarsOversikt] if report_data.flerarsOversikt else []

        # --- NYTT: Beräkna data för Resultatdisposition ---
        balanserat_resultat = k2_results['balance_sheet']['free_equity_retained']['current']
        arets_resultat = k2_results['profit_loss']['current']
        # NYTT: Hämta utdelning från report_data
        utdelning = getattr(report_data, 'dividend', 0) or 0
        print("DEBUG: Utdelning i PDF-generatorn:", utdelning)
        balanseras_i_ny_rakning = balanserat_resultat + arets_resultat - utdelning

        resultatdisposition = {
            "balanserat_resultat": balanserat_resultat,
            "arets_resultat": arets_resultat,
            "summa": balanserat_resultat + arets_resultat,
            "utdelning": utdelning,
            "balanseras_i_ny_rakning": balanseras_i_ny_rakning
        }

        # --- NYTT: Beräkna data för Förändringar i eget kapital ---
        # Ingående värden (föregående år)
        ing_aktiekapital = k2_results['balance_sheet']['restricted_equity']['previous']
        ing_balanserat_resultat = k2_results['balance_sheet']['free_equity_retained']['previous']
        ing_arets_resultat = k2_results['balance_sheet']['profit_loss_for_equity']['previous']  # 297 516 från dina data
        ing_totalt = k2_results['balance_sheet']['total_equity']['previous']
        
        # Dispositioner
        utdelning = -utdelning  # -200 000 (negativ för utdelning på balanserat resultat)
        balanseras_i_ny_rakning = ing_arets_resultat  # 297 516 (föregående års resultat balanseras till fritt kapital)
        
        # Årets resultat (läggs till årets resultat-kolumn)
        arets_resultat_post = arets_resultat  # -506 394
        
        # Utgående värden (aktuellt år)
        utg_aktiekapital = k2_results['balance_sheet']['restricted_equity']['current']
        utg_balanserat_resultat = ing_balanserat_resultat + utdelning + balanseras_i_ny_rakning  # 1 611 551 - 200 000 + 297 516 = 1 709 067
        utg_arets_resultat = -balanseras_i_ny_rakning + arets_resultat_post  # -297 516 - 506 394 = -803 910? Nej, vänta...
        # FIX: Efter balanseras blir årets resultat 0, sedan läggs årets nya resultat till: 0 + (-506 394) = -506 394
        utg_arets_resultat = arets_resultat_post  # -506 394 (eftersom balanseras nollställer föregående)
        utg_totalt = utg_aktiekapital + utg_balanserat_resultat + utg_arets_resultat  # 50 000 + 1 709 067 - 506 394 = 1 252 673
        
        forandringar_ek = {
            "ing_aktiekapital": ing_aktiekapital,
            "ing_balanserat_resultat": ing_balanserat_resultat,
            "ing_arets_resultat": ing_arets_resultat,
            "ing_totalt": ing_totalt,
            "utdelning": utdelning,
            "balanseras_i_ny_rakning": balanseras_i_ny_rakning,
            "arets_resultat": arets_resultat_post,
            "utg_aktiekapital": utg_aktiekapital,
            "utg_balanserat_resultat": utg_balanserat_resultat,
            "utg_arets_resultat": utg_arets_resultat,
            "utg_totalt": utg_totalt,
        }
        # --- SLUT PÅ NYTT ---

        template_context = {
            "company_name": company_name,
            "org_nr": org_nr,
            "start_date": report_data.start_date,
            "end_date": report_data.end_date,
            "forvaltningsberattelse": report_data.forvaltningsberattelse or "",
            "flerarsoversikt": k2_results.get("flerarsoversikt", {}),
            "signature_city": report_data.signature_city,
            "signature_date": report_data.signature_date,
            "representatives": representatives,
            "is_preview": is_preview,
            "k2_results": k2_results,
            "notes_data": notes_data,
            "resultatdisposition": resultatdisposition,
            # NYTT: Lägg till den nya datan i kontexten
            "forandringar_ek": forandringar_ek,
            # NYTT: Inkludera flerarsOversikt från report_data
            "flerarsOversikt": flerarsOversikt,
            # NYTT: Inkludera hela k2_results för Resultaträkning och Balansräkning
            "income_statement": k2_results.get("income_statement", {}),
            "balance_sheet": k2_results.get("balance_sheet", {}),
            # FIX: Lägg till profit_loss och andra summeringar på toppnivå för att matcha HTML-mallen
            "profit_loss": k2_results.get("profit_loss", {}),
            "total_assets": k2_results.get("total_assets", {}),
            "total_equity_and_liabilities": k2_results.get("total_equity_and_liabilities", {}),
            "balance_check": k2_results.get("balance_check", {}),
        }

        # Rendera HTML från template med Environment (för att använda filter)
        template_path = os.path.join(os.path.dirname(__file__), 'templates', 'annual_report.html')
        with open(template_path, 'r', encoding='utf-8') as f:
            template_content = f.read()
        
        template = env.from_string(template_content)  # Använd Environment istället för Template
        html_content = template.render(**template_context)
    
        pdf_bytes = HTML(string=html_content).write_pdf()
        return pdf_bytes
    except Exception as e:
        traceback.print_exc()
        raise e
