import jinja2
from weasyprint import HTML
import traceback

from . import k2_calculator

def create_annual_report_pdf(report, is_preview: bool = False):
    """
    Genererar en PDF för en årsredovisning från ett databasobjekt.
    """
    try:
        accounts_data_dict = report.accounts_data
        current_year_accounts = accounts_data_dict.get('current_year', [])
        previous_year_accounts = accounts_data_dict.get('previous_year', [])

        # 1. Få den platta dictionaryn från kalkylatorn
        flat_results = k2_calculator.calculate_k2_values(current_year_accounts, previous_year_accounts)

        # 2. Bygg den nästlade strukturen som mallen förväntar sig
        structured_results = {
            # Toppnivå-värden som används direkt
            "profit_loss": flat_results.get('profit_loss', 0),
            "profit_loss_prev": flat_results.get('prev_profit_loss', 0),
            "free_equity": flat_results.get('non_restricted_equity', 0),
            "free_equity_prev": flat_results.get('prev_non_restricted_equity', 0),
            "total_assets": flat_results.get('total_assets', 0),
            "total_assets_prev": flat_results.get('prev_total_assets', 0),
            "total_equity": flat_results.get('total_equity', 0),
            "total_equity_prev": flat_results.get('prev_total_equity', 0),
            "total_equity_and_liabilities": flat_results.get('total_equity_and_liabilities', 0),
            "total_equity_and_liabilities_prev": flat_results.get('prev_total_equity_and_liabilities', 0),

            # Resultaträkning - Aktuellt år
            "income_statement": {
                "net_sales": flat_results.get('net_sales', 0),
                "cost_of_goods": flat_results.get('cost_raw_materials', 0), # Mallen använder cost_of_goods
                "other_external_costs": flat_results.get('cost_external_services', 0), # Mallen använder other_external_costs
                "personnel_costs": flat_results.get('cost_personnel', 0),
                "depreciation": flat_results.get('depreciation', 0),
                "total_operating_expenses": flat_results.get('total_operating_expenses', 0),
                "operating_profit": flat_results.get('operating_profit', 0),
                "financial_items": flat_results.get('net_financial_items', 0),
                "profit_after_financial_items": flat_results.get('profit_after_financial_items', 0),
                "tax": flat_results.get('tax', 0),
            },
            # Resultaträkning - Föregående år
            "income_statement_prev": {
                "net_sales": flat_results.get('prev_net_sales', 0),
                "cost_of_goods": flat_results.get('prev_cost_raw_materials', 0),
                "other_external_costs": flat_results.get('prev_cost_external_services', 0),
                "personnel_costs": flat_results.get('prev_cost_personnel', 0),
                "depreciation": flat_results.get('prev_depreciation', 0),
                "total_operating_expenses": flat_results.get('prev_total_operating_expenses', 0),
                "operating_profit": flat_results.get('prev_operating_profit', 0),
                "financial_items": flat_results.get('prev_net_financial_items', 0),
                "profit_after_financial_items": flat_results.get('prev_profit_after_financial_items', 0),
                "tax": flat_results.get('prev_tax', 0),
            },
            # Balansräkning - Aktuellt år
            "balance_sheet": {
                "fixed_assets_tangible": flat_results.get('fixed_assets_material', 0),
                "total_fixed_assets": flat_results.get('total_fixed_assets', 0),
                "inventory": flat_results.get('inventory', 0),
                "current_receivables": flat_results.get('total_current_receivables', 0),
                "cash_and_bank": flat_results.get('cash_and_bank', 0),
                "total_current_assets": flat_results.get('total_current_assets', 0),
                "restricted_equity": flat_results.get('restricted_equity', 0),
                "untaxed_reserves": flat_results.get('untaxed_reserves', 0),
                "long_term_liabilities": flat_results.get('long_term_liabilities', 0),
                "current_liabilities": flat_results.get('short_term_liabilities', 0),
                "total_liabilities": flat_results.get('total_liabilities', 0),
            },
            # Balansräkning - Föregående år
            "balance_sheet_prev": {
                "fixed_assets_tangible": flat_results.get('prev_fixed_assets_material', 0),
                "total_fixed_assets": flat_results.get('prev_total_fixed_assets', 0),
                "inventory": flat_results.get('prev_inventory', 0),
                "current_receivables": flat_results.get('prev_total_current_receivables', 0),
                "cash_and_bank": flat_results.get('prev_cash_and_bank', 0),
                "total_current_assets": flat_results.get('prev_total_current_assets', 0),
                "restricted_equity": flat_results.get('prev_restricted_equity', 0),
                "untaxed_reserves": flat_results.get('prev_untaxed_reserves', 0),
                "long_term_liabilities": flat_results.get('prev_long_term_liabilities', 0),
                "current_liabilities": flat_results.get('prev_short_term_liabilities', 0),
                "total_liabilities": flat_results.get('prev_total_liabilities', 0),
            }
        }

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
            "k2_results": structured_results, # Skicka den nya, nästlade strukturen
        }

        template_loader = jinja2.FileSystemLoader(searchpath="./app/templates")
        template_env = jinja2.Environment(loader=template_loader)
        template = template_env.get_template("annual_report.html")
        html_content = template.render(template_context)

        pdf_bytes = HTML(string=html_content).write_pdf()
        return pdf_bytes
    except Exception as e:
        traceback.print_exc()
        raise e
