"""
This module contains the core logic for calculating a K2-compliant annual report
from raw account line data.
"""
from collections import defaultdict

# This is a simplified mapping. A real-world application would require a more
# detailed and configurable chart of accounts.
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
        "Ovriga rorelseintakter": list(range(3800, 4000)),
        "Rorelsens kostnader": list(range(4000, 8000)), # Simplified grouping
        "Finansiella poster": list(range(8200, 8500)),
        "Bokslutsdispositioner": list(range(8800, 8900)),
        "Skatt pa arets resultat": list(range(8900, 9000)),
    }
}

def calculate_k2_report(account_lines: list) -> dict:
    report = {
        "balance_sheet": defaultdict(float),
        "income_statement": defaultdict(float),
        "unmatched_accounts": [],
        "validation_errors": []
    }

    account_to_bs_category = {acc: cat for cat, acc_list in K2_MAPPINGS["balance_sheet"].items() for acc in acc_list}
    account_to_is_category = {acc: cat for cat, acc_list in K2_MAPPINGS["income_statement"].items() for acc in acc_list}

    for line in account_lines:
        acc_num = int(line.account_number)
        balance = line.balance_current_year

        if acc_num in account_to_bs_category:
            category = account_to_bs_category[acc_num]
            report["balance_sheet"][category] += balance
        elif acc_num in account_to_is_category:
            category = account_to_is_category[acc_num]
            report["income_statement"][category] += balance
        else:
            report["unmatched_accounts"].append(line.account_number)

    # --- Calculate Derived Values ---
    is_calc = report["income_statement"]
    rorelseintakter = is_calc["Nettoomsattning"] + is_calc["Ovriga rorelseintakter"]
    is_calc["Rorelseresultat"] = rorelseintakter + is_calc["Rorelsens kostnader"]
    is_calc["Resultat efter finansiella poster"] = is_calc["Rorelseresultat"] + is_calc["Finansiella poster"]
    is_calc["Resultat fore skatt"] = is_calc["Resultat efter finansiella poster"] + is_calc["Bokslutsdispositioner"]
    is_calc["Arets resultat"] = is_calc["Resultat fore skatt"] + is_calc["Skatt pa arets resultat"]

    bs_calc = report["balance_sheet"]
    bs_calc["Arets resultat"] = is_calc["Arets resultat"]

    total_tillgangar = sum(v for k, v in bs_calc.items() if k in K2_MAPPINGS["balance_sheet"] and any(int(acc) < 2000 for acc in K2_MAPPINGS["balance_sheet"][k]))
    total_ek_skulder = sum(v for k, v in bs_calc.items() if k in K2_MAPPINGS["balance_sheet"] and any(int(acc) >= 2000 for acc in K2_MAPPINGS["balance_sheet"][k])) + bs_calc["Arets resultat"]

    if abs(total_tillgangar + total_ek_skulder) > 0.01:
        report["validation_errors"].append("Balansräkningen balanserar inte.")

    report["balance_sheet"] = dict(report["balance_sheet"])
    report["income_statement"] = dict(report["income_statement"])
    return report
