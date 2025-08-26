from . import models
from typing import List, Dict

def perform_calculations(report: models.AnnualReport) -> models.AnnualReport:
    """
    Performs high-level calculations on a detailed AnnualReport model.
    For example, calculates the final result.
    This is a simplified representation.
    """

    # --- Calculate Income Statement ---
    rorelseintakter = (report.is_nettoomsattning or 0) + (report.is_forandring_lager or 0) + (report.is_ovriga_rorelseintakter or 0)

    rorelsekostnader = ((report.is_kostnad_ravaror or 0) + (report.is_kostnad_externa or 0) +
                       (report.is_kostnad_personal or 0) + (report.is_avskrivningar or 0))

    rorelseresultat = rorelseintakter - rorelsekostnader # Costs are positive numbers

    finansiellt_resultat = (report.is_finansiella_intakter or 0) - (report.is_finansiella_kostnader or 0)

    resultat_efter_fin_poster = rorelseresultat + finansiellt_resultat

    resultat_fore_skatt = resultat_efter_fin_poster + (report.is_bokslutsdispositioner or 0)

    arets_resultat = resultat_fore_skatt - (report.is_skatt or 0)

    # --- Update the report model with the calculated result ---
    report.bs_arets_resultat_ek = arets_resultat

    # --- Perform Validation ---
    total_assets = ((report.bs_materiella_anlaggningstillgangar or 0) +
                    (report.bs_finansiella_anlaggningstillgangar or 0) +
                    (report.bs_varulager or 0) +
                    (report.bs_kundfordringar or 0) +
                    (report.bs_ovriga_fordringar or 0) +
                    (report.bs_forutbetalda_kostnader or 0) +
                    (report.bs_kassa_bank or 0))

    total_equity_and_liabilities = ((report.bs_bundet_eget_kapital or 0) +
                                    (report.bs_fritt_eget_kapital or 0) +
                                    (report.bs_arets_resultat_ek or 0) +
                                    (report.bs_obeskattade_reserver or 0) +
                                    (report.bs_langfristiga_skulder or 0) +
                                    (report.bs_kortfristiga_skulder or 0))

    # Note: In proper accounting, liabilities and equity are credits (negative).
    # Assuming the input form takes positive numbers for these.
    # The validation should be Assets = Equity + Liabilities.
    # Or Assets - Liabilities - Equity = 0.
    # For now, we'll just return the calculated values.

    return report

def _sum_accounts(accounts: List[Dict], start_range: int, end_range: int) -> float:
    """Hjälpfunktion för att summera balansen för konton inom ett visst intervall."""
    total = 0.0
    for acc in accounts:
        try:
            acc_num = int(acc.get("account_number", 0))
            if start_range <= acc_num <= end_range:
                total += acc.get("balance", 0.0)
        except (ValueError, TypeError):
            continue
    return total

def calculate_k2_values(accounts: List[Dict], prev_accounts: List[Dict]) -> Dict[str, float]:
    """
    Beräknar K2-nyckeltal från råa kontolistor och returnerar dem som en PLATT dictionary.
    Denna funktion är nu en intern hjälpfunktion.
    """
    # --- HJÄLPFUNKTION FÖR ATT HANTERA BÅDA ÅREN ---
    def calculate_for_year(accs):
        res = {}
        # Resultaträkning (Intäkter är negativa i SIE, kostnader positiva)
        res['net_sales'] = _sum_accounts(accs, 3000, 3799) * -1
        res['cost_raw_materials'] = _sum_accounts(accs, 4000, 4999)
        res['cost_external_services'] = _sum_accounts(accs, 5000, 6999)
        res['cost_personnel'] = _sum_accounts(accs, 7000, 7699)
        res['depreciation'] = _sum_accounts(accs, 7700, 7899)
        res['net_financial_items'] = (_sum_accounts(accs, 8000, 8399) * -1) - _sum_accounts(accs, 8400, 8799)
        res['tax'] = _sum_accounts(accs, 8900, 8999)
        
        # Balansräkning (Tillgångar är positiva, Eget Kapital/Skulder är negativa i SIE)
        res['fixed_assets_material'] = _sum_accounts(accs, 1100, 1299)
        res['inventory'] = _sum_accounts(accs, 1400, 1499)
        res['total_current_receivables'] = _sum_accounts(accs, 1500, 1799)
        res['cash_and_bank'] = _sum_accounts(accs, 1900, 1999)
        res['restricted_equity'] = _sum_accounts(accs, 2000, 2089) * -1
        res['non_restricted_equity'] = _sum_accounts(accs, 2090, 2098) * -1 # Exkl. årets resultat
        res['untaxed_reserves'] = _sum_accounts(accs, 2100, 2199) * -1
        res['long_term_liabilities'] = _sum_accounts(accs, 2300, 2399) * -1
        res['short_term_liabilities'] = _sum_accounts(accs, 2400, 2999) * -1
        
        # Summeringar
        res['total_operating_expenses'] = res['cost_raw_materials'] + res['cost_external_services'] + res['cost_personnel'] + res['depreciation']
        res['operating_profit'] = res['net_sales'] - res['total_operating_expenses']
        res['profit_after_financial_items'] = res['operating_profit'] + res['net_financial_items']
        res['profit_loss'] = res['profit_after_financial_items'] - res['tax']
        
        res['total_fixed_assets'] = res['fixed_assets_material'] # Förenkling för nu
        res['total_current_assets'] = res['inventory'] + res['total_current_receivables'] + res['cash_and_bank']
        res['total_assets'] = res['total_fixed_assets'] + res['total_current_assets']
        
        res['total_equity'] = res['restricted_equity'] + res['non_restricted_equity'] + res['profit_loss']
        res['total_liabilities'] = res['long_term_liabilities'] + res['short_term_liabilities']
        res['total_equity_and_liabilities'] = res['total_equity'] + res['untaxed_reserves'] + res['total_liabilities']
        
        return res

    current_results = calculate_for_year(accounts)
    prev_results = calculate_for_year(prev_accounts)

    # Kombinera resultaten till en platt dictionary
    flat_results = {}
    for key, value in current_results.items():
        flat_results[key] = value
    for key, value in prev_results.items():
        flat_results[f"prev_{key}"] = value
        
    return flat_results

def get_structured_k2_results(accounts: List[Dict], prev_accounts: List[Dict]) -> Dict:
    """
    HUVUDFUNKTION: Tar råa konton och returnerar den nästlade datastrukturen
    som frontend och PDF-generatorn behöver.
    """
    flat_results = calculate_k2_values(accounts, prev_accounts)

    def get_section(key: str) -> Dict[str, float]:
        return {"current": flat_results.get(key, 0), "previous": flat_results.get(f"prev_{key}", 0)}

    structured_results = {
        "profit_loss": get_section("profit_loss"),
        "free_equity": get_section("non_restricted_equity"),
        "total_assets": get_section("total_assets"),
        "total_equity": get_section("total_equity"),
        "total_equity_and_liabilities": get_section("total_equity_and_liabilities"),
        "balance_check": {
            "current": flat_results.get("total_assets", 0) - flat_results.get("total_equity_and_liabilities", 0),
            "previous": flat_results.get("prev_total_assets", 0) - flat_results.get("prev_total_equity_and_liabilities", 0)
        },
        "income_statement": {
            "net_sales": get_section("net_sales"),
            "cost_of_goods": get_section("cost_raw_materials"),
            "other_external_costs": get_section("cost_external_services"),
            "personnel_costs": get_section("cost_personnel"),
            "depreciation": get_section("depreciation"),
            "total_operating_expenses": get_section("total_operating_expenses"),
            "operating_profit": get_section("operating_profit"),
            "financial_items": get_section("net_financial_items"),
            "profit_after_financial_items": get_section("profit_after_financial_items"),
            "tax": get_section("tax"),
        },
        "balance_sheet": {
            "fixed_assets_tangible": get_section("fixed_assets_material"),
            "total_fixed_assets": get_section("total_fixed_assets"),
            "inventory": get_section("inventory"),
            "current_receivables": get_section("total_current_receivables"),
            "cash_and_bank": get_section("cash_and_bank"),
            "total_current_assets": get_section("total_current_assets"),
            "restricted_equity": get_section("restricted_equity"),
            "untaxed_reserves": get_section("untaxed_reserves"),
            "long_term_liabilities": get_section("long_term_liabilities"),
            "current_liabilities": get_section("short_term_liabilities"),
            "total_liabilities": get_section("total_liabilities"),
        }
    }
    return structured_results
