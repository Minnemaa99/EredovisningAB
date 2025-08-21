from collections import defaultdict

K2_MAPPINGS = {
    "balance_sheet": {
        "materiella_anlaggningstillgangar": list(range(1200, 1300)),
        "finansiella_anlaggningstillgangar": list(range(1300, 1400)),
        "varulager_mm": list(range(1400, 1500)),
        "kortfristiga_fordringar": list(range(1500, 1800)),
        "kortfristiga_placeringar": list(range(1800, 1900)),
        "kassa_och_bank": list(range(1900, 2000)),
        "bundet_eget_kapital": list(range(2080, 2090)),
        "fritt_eget_kapital": list(range(2090, 2100)),
        "obeskattade_reserver": list(range(2100, 2200)),
        "langfristiga_skulder": list(range(2300, 2400)),
        "kortfristiga_skulder": list(range(2400, 3000)),
    },
    "income_statement": {
        "nettoomsattning": list(range(3000, 3800)),
        "forandring_av_lager": list(range(4900, 5000)),
        "ovriga_rorelseintakter": list(range(3800, 4000)),
        "ravaror_och_fornoddenheter": list(range(4000, 4800)),
        "ovriga_externa_kostnader": list(range(5000, 6900)),
        "personalkostnader": list(range(7000, 7700)),
        "avskrivningar": list(range(7700, 7900)),
        "ovriga_rorelsekostnader": list(range(7900, 8000)),
        "finansiella_poster": list(range(8200, 8500)),
        "bokslutsdispositioner": list(range(8800, 8900)),
        "skatt_pa_arets_resultat": list(range(8900, 9000)),
    }
}

def calculate_from_sie_data(sie_data) -> dict:
    account_balances = defaultdict(float)
    verifications = sie_data.get_data('#VER')
    for ver in verifications:
        for trans in ver.trans_list:
            account_balances[trans.kontonr] += trans.belopp
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
                if balance != 0:
                    report["unmatched_accounts"].append(acc_str)
        except (ValueError, TypeError):
            report["unmatched_accounts"].append(acc_str)

    is_calc = report["income_statement"]
    is_calc["rorelseresultat"] = (is_calc.get("nettoomsattning", 0) + is_calc.get("forandring_av_lager", 0) +
                                  is_calc.get("ovriga_rorelseintakter", 0) + is_calc.get("ravaror_och_fornoddenheter", 0) +
                                  is_calc.get("ovriga_externa_kostnader", 0) + is_calc.get("personalkostnader", 0) +
                                  is_calc.get("avskrivningar", 0) + is_calc.get("ovriga_rorelsekostnader", 0))
    is_calc["resultat_efter_finansiella_poster"] = is_calc["rorelseresultat"] + is_calc.get("finansiella_poster", 0)
    is_calc["resultat_fore_skatt"] = is_calc["resultat_efter_finansiella_poster"] + is_calc.get("bokslutsdispositioner", 0)
    is_calc["arets_resultat"] = is_calc["resultat_fore_skatt"] + is_calc.get("skatt_pa_arets_resultat", 0)

    bs_calc = report["balance_sheet"]
    bs_calc["arets_resultat"] = is_calc["arets_resultat"]

    total_assets = (bs_calc.get("materiella_anlaggningstillgangar", 0) + bs_calc.get("finansiella_anlaggningstillgangar", 0) +
                    bs_calc.get("varulager_mm", 0) + bs_calc.get("kortfristiga_fordringar", 0) +
                    bs_calc.get("kortfristiga_placeringar", 0) + bs_calc.get("kassa_och_bank", 0))
    total_equity_and_liabilities = (bs_calc.get("bundet_eget_kapital", 0) + bs_calc.get("fritt_eget_kapital", 0) +
                                    bs_calc.get("arets_resultat", 0) + bs_calc.get("obeskattade_reserver", 0) +
                                    bs_calc.get("langfristiga_skulder", 0) + bs_calc.get("kortfristiga_skulder", 0))

    if abs(total_assets + total_equity_and_liabilities) > 0.01:
        report["validation_errors"].append("Balansräkningen balanserar inte.")

    report["balance_sheet"] = dict(report["balance_sheet"])
    report["income_statement"] = dict(report["income_statement"])

    return report
