from collections import defaultdict

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
        "Finansiella poster": list(range(8200, 8500)),
        "Bokslutsdispositioner": list(range(8800, 8900)),
        "Skatt pa arets resultat": list(range(8900, 9000)),
    }
}

def calculate_from_sie_data(sie_data) -> dict:
    """
    Takes parsed SIE data and calculates a structured K2 report.
    """
    account_balances = defaultdict(float)
    verifications = sie_data.get_data('#VER')
    for ver in verifications:
        for trans in ver.trans_list:
            account_balances[trans.kontonr] += trans.belopp

    # --- Re-use the main calculation logic ---
    return calculate_from_balances(dict(account_balances))


def calculate_from_balances(account_balances: dict) -> dict:
    report = {
        "balance_sheet": defaultdict(float),
        "income_statement": defaultdict(float),
        "unmatched_accounts": [],
        "validation_errors": []
    }

    account_to_bs_category = {acc: cat for cat, acc_list in K2_MAPPINGS["balance_sheet"].items() for acc in acc_list}
    account_to_is_category = {acc: cat for cat, acc_list in K2_MAPPINGS["income_statement"].items() for acc in acc_list}

    for acc_str, balance in account_balances.items():
        try:
            acc_num = int(acc_str)
            balance = float(balance)

            if acc_num in account_to_bs_category:
                report["balance_sheet"][account_to_bs_category[acc_num]] += balance
            elif acc_num in account_to_is_category:
                report["income_statement"][account_to_is_category[acc_num]] += balance
            else:
                if balance != 0: # Only report unmatched accounts with a balance
                    report["unmatched_accounts"].append(acc_str)
        except (ValueError, TypeError):
            report["unmatched_accounts"].append(acc_str)

    # --- Calculate Derived Values ---
    is_calc = report["income_statement"]
    is_calc["Rorelseresultat"] = (is_calc.get("Nettoomsattning", 0) + is_calc.get("Forandring av lager", 0) +
                                  is_calc.get("Ovriga rorelseintakter", 0) + is_calc.get("Ravaror och fornoddenheter", 0) +
                                  is_calc.get("Ovriga externa kostnader", 0) + is_calc.get("Personalkostnader", 0) +
                                  is_calc.get("Avskrivningar", 0) + is_calc.get("Ovriga rorelsekostnader", 0))
    is_calc["Resultat efter finansiella poster"] = is_calc["Rorelseresultat"] + is_calc.get("Finansiella poster", 0)
    is_calc["Resultat fore skatt"] = is_calc["Resultat efter finansiella poster"] + is_calc.get("Bokslutsdispositioner", 0)
    is_calc["Arets resultat"] = is_calc["Resultat fore skatt"] + is_calc.get("Skatt pa arets resultat", 0)

    bs_calc = report["balance_sheet"]
    bs_calc["Arets resultat"] = is_calc["Arets resultat"]

    total_assets = sum(v for k, v in bs_calc.items() if k in K2_MAPPINGS["balance_sheet"] and any(int(acc) < 2000 for acc in K2_MAPPINGS["balance_sheet"][k]))
    total_equity_and_liabilities = (bs_calc.get("Bundet eget kapital", 0) + bs_calc.get("Fritt eget kapital", 0) +
                                    bs_calc.get("Arets resultat", 0) + bs_calc.get("Obeskattade reserver", 0) +
                                    bs_calc.get("Langfristiga skulder", 0) + bs_calc.get("Kortfristiga skulder", 0))

    if abs(total_assets + total_equity_and_liabilities) > 0.01:
        report["validation_errors"].append("Balansräkningen balanserar inte.")

    report["balance_sheet"] = dict(report["balance_sheet"])
    report["income_statement"] = dict(report["income_statement"])

    return report
