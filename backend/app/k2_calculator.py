from . import models

def perform_calculations(report: models.AnnualReport) -> models.AnnualReport:
    """
    Fyller i resultaträkning och balansposter från parserade SIE-data.
    Summerar transaktioner per konto och uppdaterar report-objektet.
    """
    # --- Mappning: SIE-konton till report-fält ---
    konto_to_field = {
        3001: "is_nettoomsattning",
        3002: "is_forandring_lager",
        3003: "is_ovriga_rorelseintakter",
        4001: "is_kostnad_ravaror",
        4002: "is_kostnad_externa",
        4003: "is_kostnad_personal",
        5001: "is_avskrivningar",
        6001: "is_finansiella_intakter",
        6002: "is_finansiella_kostnader",
        7001: "is_bokslutsdispositioner",
        8001: "is_skatt",
    }

    # --- Initiera fälten till 0 ---
    for field in konto_to_field.values():
        setattr(report, field, 0)

    # --- Summera belopp från SIE-data ---
    if hasattr(report, "sie_data") and report.sie_data:
        sie_data = report.sie_data
        for verification in sie_data.verifications:
            for trans in verification.transactions:
                try:
                    konto = int(trans.kontonr)
                    belopp = float(trans.belopp)
                except ValueError:
                    continue  # Hoppa över ogiltiga värden

                field = konto_to_field.get(konto)
                if field:
                    current_value = getattr(report, field) or 0
                    setattr(report, field, current_value + belopp)

    # --- Beräkna resultaträkning ---
    rorelseintakter = (report.is_nettoomsattning or 0) + (report.is_forandring_lager or 0) + (report.is_ovriga_rorelseintakter or 0)
    rorelsekostnader = ((report.is_kostnad_ravaror or 0) + (report.is_kostnad_externa or 0) +
                        (report.is_kostnad_personal or 0) + (report.is_avskrivningar or 0))
    rorelseresultat = rorelseintakter - rorelsekostnader
    finansiellt_resultat = (report.is_finansiella_intakter or 0) - (report.is_finansiella_kostnader or 0)
    resultat_efter_fin_poster = rorelseresultat + finansiellt_resultat
    resultat_fore_skatt = resultat_efter_fin_poster + (report.is_bokslutsdispositioner or 0)
    arets_resultat = resultat_fore_skatt - (report.is_skatt or 0)

    # --- Uppdatera report ---
    report.bs_arets_resultat_ek = arets_resultat

    # --- Validera balansposter ---
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

    # Om du vill kan du spara totals också:
    report.total_assets = total_assets
    report.total_equity_and_liabilities = total_equity_and_liabilities

    return report
