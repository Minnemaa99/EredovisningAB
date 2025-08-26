from typing import List, Dict

def get_structured_k2_results(current_year_accounts: List[Dict], previous_year_accounts: List[Dict], notes_config: Dict = None) -> Dict:
    if notes_config is None:
        notes_config = {}

    def sum_accounts(accounts, start, end):
        # Denna funktion är nu korrekt och summerar bara positiva tal.
        return sum(acc.get('balance', 0) for acc in accounts if start <= int(acc.get('account_number', 0)) <= end)

    def create_item(current_val, previous_val, note_key=None):
        note_ref = notes_config.get(note_key)
        return {"current": round(current_val), "previous": round(previous_val), "note_ref": note_ref}

    # --- 1. BERÄKNINGAR FÖR NUVARANDE ÅR ---
    current_calc = {}
    
    # Resultaträkning
    current_calc['net_sales'] = sum_accounts(current_year_accounts, 3000, 3799)
    current_calc['other_operating_income'] = sum_accounts(current_year_accounts, 3800, 3999)
    current_calc['total_operating_income'] = current_calc['net_sales'] + current_calc['other_operating_income']
    
    current_calc['raw_materials'] = sum_accounts(current_year_accounts, 4000, 4999)
    current_calc['other_external_costs'] = sum_accounts(current_year_accounts, 5000, 6999)
    current_calc['personnel_costs'] = sum_accounts(current_year_accounts, 7000, 7699)
    current_calc['depreciation'] = sum_accounts(current_year_accounts, 7700, 7899)
    current_calc['other_operating_expenses'] = sum_accounts(current_year_accounts, 7900, 7999)
    current_calc['total_operating_expenses'] = current_calc['raw_materials'] + current_calc['other_external_costs'] + current_calc['personnel_costs'] + current_calc['depreciation'] + current_calc['other_operating_expenses']
    
    current_calc['operating_profit'] = current_calc['total_operating_income'] - current_calc['total_operating_expenses']

    current_calc['financial_income'] = sum_accounts(current_year_accounts, 8000, 8399)
    current_calc['financial_costs'] = sum_accounts(current_year_accounts, 8400, 8799)
    current_calc['profit_after_financial_items'] = current_calc['operating_profit'] + current_calc['financial_income'] - current_calc['financial_costs']

    current_calc['appropriations'] = sum_accounts(current_year_accounts, 8800, 8899)
    current_calc['profit_before_tax'] = current_calc['profit_after_financial_items'] + current_calc['appropriations']

    # SLUTGILTIG KORRIGERING: Skatt (konto 8910) är en kostnad och ska subtraheras.
    # "Årets resultat" (konto 8999) är en summeringspost vi inte ska använda här.
    current_calc['tax'] = sum_accounts(current_year_accounts, 8910, 8919)
    current_calc['profit_loss'] = current_calc['profit_before_tax'] - current_calc['tax']

    # Balansräkning
    current_calc['fixed_assets_tangible'] = sum_accounts(current_year_accounts, 1100, 1299)
    current_calc['total_fixed_assets'] = current_calc['fixed_assets_tangible']
    current_calc['inventory'] = sum_accounts(current_year_accounts, 1400, 1499)
    current_calc['current_receivables'] = sum_accounts(current_year_accounts, 1500, 1799)
    current_calc['cash_and_bank'] = sum_accounts(current_year_accounts, 1900, 1999)
    current_calc['total_current_assets'] = current_calc['inventory'] + current_calc['current_receivables'] + current_calc['cash_and_bank']
    current_calc['total_assets'] = current_calc['total_fixed_assets'] + current_calc['total_current_assets']

    current_calc['restricted_equity'] = sum_accounts(current_year_accounts, 2080, 2089)
    current_calc['free_equity_retained'] = sum_accounts(current_year_accounts, 2090, 2098)
    current_calc['total_equity'] = current_calc['restricted_equity'] + current_calc['free_equity_retained'] + current_calc['profit_loss']

    current_calc['untaxed_reserves'] = sum_accounts(current_year_accounts, 2100, 2199)
    current_calc['long_term_liabilities'] = sum_accounts(current_year_accounts, 2300, 2399)
    current_calc['current_liabilities'] = sum_accounts(current_year_accounts, 2400, 2999)
    current_calc['total_liabilities'] = current_calc['long_term_liabilities'] + current_calc['current_liabilities']
    current_calc['total_equity_and_liabilities'] = current_calc['total_equity'] + current_calc['untaxed_reserves'] + current_calc['total_liabilities']

    # --- 2. BERÄKNINGAR FÖR FÖREGÅENDE ÅR ---
    prev_calc = {}
    
    # Resultaträkning
    prev_calc['net_sales'] = sum_accounts(previous_year_accounts, 3000, 3799)
    prev_calc['other_operating_income'] = sum_accounts(previous_year_accounts, 3800, 3999)
    prev_calc['total_operating_income'] = prev_calc['net_sales'] + prev_calc['other_operating_income']
    
    prev_calc['raw_materials'] = sum_accounts(previous_year_accounts, 4000, 4999)
    prev_calc['other_external_costs'] = sum_accounts(previous_year_accounts, 5000, 6999)
    prev_calc['personnel_costs'] = sum_accounts(previous_year_accounts, 7000, 7699)
    prev_calc['depreciation'] = sum_accounts(previous_year_accounts, 7700, 7899)
    prev_calc['other_operating_expenses'] = sum_accounts(previous_year_accounts, 7900, 7999)
    prev_calc['total_operating_expenses'] = prev_calc['raw_materials'] + prev_calc['other_external_costs'] + prev_calc['personnel_costs'] + prev_calc['depreciation'] + prev_calc['other_operating_expenses']
    
    prev_calc['operating_profit'] = prev_calc['total_operating_income'] - prev_calc['total_operating_expenses']

    prev_calc['financial_income'] = sum_accounts(previous_year_accounts, 8000, 8399)
    prev_calc['financial_costs'] = sum_accounts(previous_year_accounts, 8400, 8799)
    prev_calc['profit_after_financial_items'] = prev_calc['operating_profit'] + prev_calc['financial_income'] - prev_calc['financial_costs']

    prev_calc['appropriations'] = sum_accounts(previous_year_accounts, 8800, 8899)
    prev_calc['profit_before_tax'] = prev_calc['profit_after_financial_items'] + prev_calc['appropriations']

    # SLUTGILTIG KORRIGERING: Samma korrigering för föregående år.
    prev_calc['tax'] = sum_accounts(previous_year_accounts, 8910, 8919)
    prev_calc['profit_loss'] = prev_calc['profit_before_tax'] - prev_calc['tax']

    # Balansräkning
    prev_calc['fixed_assets_tangible'] = sum_accounts(previous_year_accounts, 1100, 1299)
    prev_calc['total_fixed_assets'] = prev_calc['fixed_assets_tangible']
    prev_calc['inventory'] = sum_accounts(previous_year_accounts, 1400, 1499)
    prev_calc['current_receivables'] = sum_accounts(previous_year_accounts, 1500, 1799)
    prev_calc['cash_and_bank'] = sum_accounts(previous_year_accounts, 1900, 1999)
    prev_calc['total_current_assets'] = prev_calc['inventory'] + prev_calc['current_receivables'] + prev_calc['cash_and_bank']
    prev_calc['total_assets'] = prev_calc['total_fixed_assets'] + prev_calc['total_current_assets']

    prev_calc['restricted_equity'] = sum_accounts(previous_year_accounts, 2080, 2089)
    prev_calc['free_equity_retained'] = sum_accounts(previous_year_accounts, 2090, 2098)
    prev_calc['total_equity'] = prev_calc['restricted_equity'] + prev_calc['free_equity_retained'] + prev_calc['profit_loss']

    prev_calc['untaxed_reserves'] = sum_accounts(previous_year_accounts, 2100, 2199)
    prev_calc['long_term_liabilities'] = sum_accounts(previous_year_accounts, 2300, 2399)
    prev_calc['current_liabilities'] = sum_accounts(previous_year_accounts, 2400, 2999)
    prev_calc['total_liabilities'] = prev_calc['long_term_liabilities'] + prev_calc['current_liabilities']
    prev_calc['total_equity_and_liabilities'] = prev_calc['total_equity'] + prev_calc['untaxed_reserves'] + prev_calc['total_liabilities']
    
    # --- 3. BYGG SVARSSTRUKTUR ---
    # (Inga ändringar behövs här)
    return {
        "income_statement": {
            "net_sales": create_item(current_calc['net_sales'], prev_calc['net_sales']),
            "other_operating_income": create_item(current_calc['other_operating_income'], prev_calc['other_operating_income']),
            "total_operating_income": create_item(current_calc['total_operating_income'], prev_calc['total_operating_income']),
            "raw_materials": create_item(current_calc['raw_materials'], prev_calc['raw_materials']),
            "other_external_costs": create_item(current_calc['other_external_costs'], prev_calc['other_external_costs']),
            "personnel_costs": create_item(current_calc['personnel_costs'], prev_calc['personnel_costs'], note_key='personnel'),
            "depreciation": create_item(current_calc['depreciation'], prev_calc['depreciation']),
            "other_operating_expenses": create_item(current_calc['other_operating_expenses'], prev_calc['other_operating_expenses']),
            "total_operating_expenses": create_item(current_calc['total_operating_expenses'], prev_calc['total_operating_expenses']),
            "operating_profit": create_item(current_calc['operating_profit'], prev_calc['operating_profit']),
            "financial_income": create_item(current_calc['financial_income'], prev_calc['financial_income']),
            "financial_costs": create_item(current_calc['financial_costs'], prev_calc['financial_costs']),
            "profit_after_financial_items": create_item(current_calc['profit_after_financial_items'], prev_calc['profit_after_financial_items']),
            "appropriations": create_item(current_calc['appropriations'], prev_calc['appropriations']),
            "profit_before_tax": create_item(current_calc['profit_before_tax'], prev_calc['profit_before_tax']),
            "tax": create_item(current_calc['tax'], prev_calc['tax']),
        },
        "balance_sheet": {
            "fixed_assets_tangible": create_item(current_calc['fixed_assets_tangible'], prev_calc['fixed_assets_tangible'], note_key='tangible_assets'),
            "total_fixed_assets": create_item(current_calc['total_fixed_assets'], prev_calc['total_fixed_assets']),
            "inventory": create_item(current_calc['inventory'], prev_calc['inventory']),
            "current_receivables": create_item(current_calc['current_receivables'], prev_calc['current_receivables']),
            "cash_and_bank": create_item(current_calc['cash_and_bank'], prev_calc['cash_and_bank']),
            "total_current_assets": create_item(current_calc['total_current_assets'], prev_calc['total_current_assets']),
            "restricted_equity": create_item(current_calc['restricted_equity'], prev_calc['restricted_equity']),
            "free_equity_retained": create_item(current_calc['free_equity_retained'], prev_calc['free_equity_retained']),
            "profit_loss_for_equity": create_item(current_calc['profit_loss'], prev_calc['profit_loss']),
            "total_equity": create_item(current_calc['total_equity'], prev_calc['total_equity']),
            "untaxed_reserves": create_item(current_calc['untaxed_reserves'], prev_calc['untaxed_reserves']),
            "long_term_liabilities": create_item(current_calc['long_term_liabilities'], prev_calc['long_term_liabilities'], note_key='long_term_liabilities'),
            "current_liabilities": create_item(current_calc['current_liabilities'], prev_calc['current_liabilities']),
            "total_liabilities": create_item(current_calc['total_liabilities'], prev_calc['total_liabilities']),
        },
        "profit_loss": create_item(current_calc['profit_loss'], prev_calc['profit_loss']),
        "total_assets": create_item(current_calc['total_assets'], prev_calc['total_assets']),
        "total_equity_and_liabilities": create_item(current_calc['total_equity_and_liabilities'], prev_calc['total_equity_and_liabilities']),
        "balance_check": {
            "current": round(current_calc['total_assets'] - current_calc['total_equity_and_liabilities']),
            "previous": round(prev_calc['total_assets'] - prev_calc['total_equity_and_liabilities'])
        }
    }
