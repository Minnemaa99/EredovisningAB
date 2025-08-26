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
    Beräknar K2-nyckeltal från råa kontolistor och returnerar dem som en dictionary.
    Detta är funktionen som crud.py förväntar sig att hitta.
    """
    results = {}

    # --- Resultaträkning (Income Statement) ---
    # Intäkter (kontogrupp 3xxx)
    results['revenue_sales'] = _sum_accounts(accounts, 3000, 3999)
    # Förändring av lager (kontogrupp 49xx)
    results['revenue_inventory_change'] = _sum_accounts(accounts, 4900, 4999)
    # Övriga rörelseintäkter (kontogrupp 3xxx, exklusive nettoomsättning)
    # Denna är ofta mer komplex, vi håller den enkel för nu.
    results['revenue_other'] = 0 

    # Kostnader
    results['costs_raw_materials'] = _sum_accounts(accounts, 4000, 4999)
    results['costs_external'] = _sum_accounts(accounts, 5000, 6999)
    results['costs_personnel'] = _sum_accounts(accounts, 7000, 7699)
    results['costs_depreciation'] = _sum_accounts(accounts, 7700, 7899)
    
    # Finansiella poster
    results['financial_income'] = _sum_accounts(accounts, 8000, 8399)
    results['financial_costs'] = _sum_accounts(accounts, 8400, 8999)

    # Bokslutsdispositioner & Skatt
    results['appropriations'] = _sum_accounts(accounts, 2100, 2199) # Ofta från balans, men påverkar resultat
    results['tax'] = _sum_accounts(accounts, 2500, 2599) # Ofta från balans, men påverkar resultat

    # --- Balansräkning (Balance Sheet) ---
    # Tillgångar
    results['fixed_assets_material'] = _sum_accounts(accounts, 1100, 1299)
    results['fixed_assets_financial'] = _sum_accounts(accounts, 1300, 1399)
    results['current_assets_inventory'] = _sum_accounts(accounts, 1400, 1499)
    results['current_assets_receivables'] = _sum_accounts(accounts, 1500, 1699)
    results['current_assets_other_receivables'] = _sum_accounts(accounts, 1700, 1799)
    results['current_assets_prepaid'] = _sum_accounts(accounts, 1700, 1799) # Ofta samma som ovan
    results['current_assets_cash_bank'] = _sum_accounts(accounts, 1900, 1999)

    # Eget kapital och skulder
    results['restricted_equity'] = _sum_accounts(accounts, 2080, 2089)
    results['free_equity'] = _sum_accounts(accounts, 2090, 2099)
    results['untaxed_reserves'] = _sum_accounts(accounts, 2100, 2199)
    results['long_term_liabilities'] = _sum_accounts(accounts, 2300, 2399)
    results['short_term_liabilities'] = _sum_accounts(accounts, 2400, 2999)

    # Årets resultat (beräknas från resultaträkningen)
    total_revenue = results['revenue_sales'] + results['revenue_inventory_change'] + results['revenue_other']
    total_costs = results['costs_raw_materials'] + results['costs_external'] + results['costs_personnel'] + results['costs_depreciation']
    profit_before_financial = total_revenue - total_costs
    profit_after_financial = profit_before_financial + results['financial_income'] - results['financial_costs']
    # Not: Förenklad beräkning
    results['profit_loss'] = profit_after_financial - results['tax']

    return results
