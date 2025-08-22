from . import models

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
