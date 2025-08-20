from app.k2_calculator import calculate_k2_report

def test_k2_calculation_with_example_data():
    """
    Tests the K2 calculation logic with the simplified example data
    provided by the user.
    """
    # Input from user's example
    input_balances = {
        "1200": 369350.0,
        "1400": 420333.0,
        "1510": 871666.0,
        "1930": 1059044.0,
        "2091": -315603.0, # Equity is a credit, so it's negative
        "2099": 0, # Årets resultat starts at 0, will be calculated
        # User example had these at 0, which means no income statement entries
        "3000": 0,
    }

    # Expected results based on the calculation logic
    # Note: The user's example output was simplified. This is the expected
    # result from the implemented logic.

    result = calculate_k2_report(input_balances)

    # --- Assertions for Balance Sheet ---
    bs = result["balance_sheet"]
    assert bs["Materiella anlaggningstillgangar"] == 369350.0
    assert bs["Varulager_mm"] == 420333.0
    assert bs["Kortfristiga fordringar"] == 871666.0
    assert bs["Kassa och bank"] == 1059044.0
    assert bs["Fritt eget kapital"] == -315603.0

    # --- Assertions for Income Statement ---
    inc = result["income_statement"]
    # Since all income/cost accounts are 0, all results should be 0
    assert inc["Nettoomsattning"] == 0
    assert inc["Rorelseresultat"] == 0
    assert inc["Resultat efter finansiella poster"] == 0
    assert inc["Arets resultat"] == 0

    # --- Assert that "Arets resultat" is also on the balance sheet ---
    assert bs["Arets resultat"] == 0

    # --- Assert Validation ---
    # The user's example data does not balance, so we expect an error.
    # Assets = 369350 + 420333 + 871666 + 1059044 = 2,720,393
    # Equity = -315603 + 0 = -315,603
    # They do not sum to 0.
    assert len(result["validation_errors"]) > 0
    assert "Balansräkningen balanserar inte" in result["validation_errors"][0]

    # --- Assert Unmatched Accounts ---
    # With the current mapping, all accounts in the test data are matched.
    assert len(result["unmatched_accounts"]) == 0
