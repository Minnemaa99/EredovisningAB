"""
This module contains the core logic for calculating a K2-compliant annual report
from raw account balance data.
"""
from collections import defaultdict

# Based on standard Swedish BAS chart of accounts for K2 reporting.
K2_MAPPINGS = {
    "balance_sheet": {
        "Materiella anlaggningstillgangar": list(range(1200, 1300)),
        "Finansiella anlaggningstillgangar": list(range(1300, 1400)),
        "Varulager_mm": list(range(1400, 1500)),
        "Kortfristiga fordringar": list(range(1500, 1800)),
        "Kortfristiga placeringar": list(range(1800, 1900)),
        "Kassa och bank": list(range(1900, 2000)),
        "Bundet eget kapital": list(range(2080, 2090)),
        "Fritt eget kapital": list(range(2090, 2100)),
        "Obeskattade reserver": list(range(2100, 2200)),
        "Langfristiga skulder": list(range(2300, 2400)),
        "Kortfristiga skulder": list(range(2400, 3000)),
    },
    "income_statement": {
        "Nettoomsattning": list(range(3000, 3800)),
        "Forandring av lager": list(range(4900, 5000)),
        "Ovriga rorelseintakter": list(range(3800, 4000)),
        "Ravaror och fornoddenheter": list(range(4000, 4800)),
        "Ovriga externa kostnader": list(range(5000, 6900)),
        "Personalkostnader": list(range(7000, 7700)),
        "Avskrivningar": list(range(7700, 7900)),
        "Ovriga rorelsekostnader": list(range(7900, 8000)),
        "Ovriga ranteintakter och liknande poster": list(range(8200, 8300)),
        "Rantekostnader och liknande poster": list(range(8300, 8400)),
        "Bokslutsdispositioner": list(range(8800, 8900)),
        "Skatt pa arets resultat": list(range(8900, 9000)),
    }
}

def calculate_k2_report(account_balances: dict) -> dict:
    report = {
        "balance_sheet": defaultdict(float),
        "income_statement": defaultdict(float),
        "unmatched_accounts": [],
        "validation_errors": []
    }

    # Invert the mapping for easier lookup
    account_to_bs_category = {acc: cat for cat, acc_list in K2_MAPPINGS["balance_sheet"].items() for acc in acc_list}
    account_to_is_category = {acc: cat for cat, acc_list in K2_MAPPINGS["income_statement"].items() for acc in acc_list}

    for acc_str, balance in account_balances.items():
        try:
            acc_num = int(acc_str)
            balance = float(balance)

            if acc_num in account_to_bs_category:
                category = account_to_bs_category[acc_num]
                report["balance_sheet"][category] += balance
            elif acc_num in account_to_is_category:
                category = account_to_is_category[acc_num]
                # Income/Revenue accounts (3xxx) are credits, so their balance should be negated
                # Cost accounts (4xxx-7xxx) are debits, so their balance is positive
                # The final calculation will handle the signs.
                report["income_statement"][category] += balance
            else:
                report["unmatched_accounts"].append(acc_str)
        except (ValueError, TypeError):
            report["unmatched_accounts"].append(acc_str)

    # --- Calculate Derived Values ---

    # Income Statement
    is_calc = report["income_statement"]
    rorelseintakter = is_calc["Nettoomsattning"] + is_calc["Forandring av lager"] + is_calc["Ovriga rorelseintakter"]
    rorelsekostnader = (is_calc["Ravaror och fornoddenheter"] + is_calc["Ovriga externa kostnader"] +
                         is_calc["Personalkostnader"] + is_calc["Avskrivningar"] + is_calc["Ovriga rorelsekostnader"])

    is_calc["Rorelseresultat"] = rorelseintakter + rorelsekostnader # Costs are positive from trial balance perspective

    finansiella_poster = is_calc["Ovriga ranteintakter och liknande poster"] + is_calc["Rantekostnader och liknande poster"]
    is_calc["Resultat efter finansiella poster"] = is_calc["Rorelseresultat"] + finansiella_poster

    is_calc["Resultat fore skatt"] = is_calc["Resultat efter finansiella poster"] + is_calc["Bokslutsdispositioner"]
    is_calc["Arets resultat"] = is_calc["Resultat fore skatt"] + is_calc["Skatt pa arets resultat"]

    # Balance Sheet
    bs_calc = report["balance_sheet"]
    bs_calc["Arets resultat"] = is_calc["Arets resultat"] # Add this year's result to the balance sheet

    anlaggningstillgangar = bs_calc["Materiella anlaggningstillgangar"] + bs_calc["Finansiella anlaggningstillgangar"]
    omsattningstillgangar = (bs_calc["Varulager_mm"] + bs_calc["Kortfristiga fordringar"] +
                             bs_calc["Kortfristiga placeringar"] + bs_calc["Kassa och bank"])
    total_tillgangar = anlaggningstillgangar + omsattningstillgangar

    eget_kapital = bs_calc["Bundet eget kapital"] + bs_calc["Fritt eget kapital"] + bs_calc["Arets resultat"]
    skulder = bs_calc["Obeskattade reserver"] + bs_calc["Langfristiga skulder"] + bs_calc["Kortfristiga skulder"]
    total_ek_skulder = eget_kapital + skulder

    # Validation
    if abs(total_tillgangar + total_ek_skulder) > 0.01: # Should sum to zero
        report["validation_errors"].append(
            f"Balansräkningen balanserar inte. Tillgångar: {total_tillgangar:.2f}, "
            f"Eget Kapital & Skulder: {-total_ek_skulder:.2f}"
        )

    # Convert defaultdicts to regular dicts for the final report
    report["balance_sheet"] = dict(report["balance_sheet"])
    report["income_statement"] = dict(report["income_statement"])

    return report
