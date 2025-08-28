import json
from typing import List, Dict, Optional
import sys # Importera sys för att kunna skriva till stderr

def get_structured_k2_results(current_year_accounts: List[Dict], previous_year_accounts: List[Dict], notes_config_path: str = "app/notes_config.json") -> Dict:
    """
    Beräknar och strukturerar resultat- och balansräkning enligt K2-regelverket.
    Hanterar not-aktivering baserat på obligatoriska regler och kontovärden.
    """
    with open(notes_config_path, 'r', encoding='utf-8') as f:
        notes_config_data = json.load(f)
    
    notes_map = {note['id']: note for note in notes_config_data['notes']}
    key_to_note_id_map = notes_config_data['key_to_note_id_map']
    
    active_notes = {}
    note_counter = 1

    # Steg 1: Lägg till obligatoriska noter först.
    for note_id, note_details in notes_map.items():
        if note_details.get('type') == 'obligatory':
            if note_id not in active_notes:
                active_notes[note_id] = { "ref": note_counter, "title": note_details['title'] }
                note_counter += 1
    
    def sum_accounts(accounts, start, end):
        """Summerar balansen för konton inom ett visst intervall."""
        return sum(acc.get('balance', 0) for acc in accounts if start <= int(acc.get('account_number', 0)) <= end)

    def create_item(current_val, previous_val, note_trigger_key=None):
        nonlocal note_counter
        note_ref = None
        
        # Steg 2: Aktivera villkorliga noter.
        if note_trigger_key and current_val != 0:
            note_id = key_to_note_id_map.get(note_trigger_key)
            if note_id and note_id not in active_notes:
                active_notes[note_id] = { "ref": note_counter, "title": notes_map[note_id]['title'] }
                note_counter += 1
            
            if note_id in active_notes:
                note_ref = active_notes[note_id]['ref']

        return {"current": round(current_val), "previous": round(previous_val), "note_ref": note_ref}

    def calculate_for_year(accounts: List[Dict]) -> Dict:
        """Kör alla beräkningar för ett givet räkenskapsår och returnerar en dictionary."""
        calc = {}
        
        # --- Resultaträkning ---
        # Intäkter är positiva, kostnader är negativa i SIE. Vi använder abs() för att visa kostnader som positiva.
        calc['net_sales'] = sum_accounts(accounts, 3000, 3799)
        calc['other_operating_income'] = sum_accounts(accounts, 3800, 3999)
        calc['total_operating_income'] = calc['net_sales'] + calc['other_operating_income']
        
        calc['raw_materials'] = abs(sum_accounts(accounts, 4000, 4999))
        calc['other_external_costs'] = abs(sum_accounts(accounts, 5000, 6999))
        calc['personnel_costs'] = abs(sum_accounts(accounts, 7000, 7699))
        calc['depreciation'] = abs(sum_accounts(accounts, 7700, 7899))
        calc['other_operating_expenses'] = abs(sum_accounts(accounts, 7900, 7999))
        calc['total_operating_expenses'] = calc['raw_materials'] + calc['other_external_costs'] + calc['personnel_costs'] + calc['depreciation'] + calc['other_operating_expenses']
        calc['operating_profit'] = calc['total_operating_income'] - calc['total_operating_expenses']

        calc['financial_income'] = sum_accounts(accounts, 8000, 8399)
        calc['financial_costs'] = abs(sum_accounts(accounts, 8400, 8799))
        # NETTO för finansiella poster (intäkter minus kostnader)
        calc['financial_total'] = calc['financial_income'] - calc['financial_costs']
        calc['profit_after_financial_items'] = calc['operating_profit'] + calc['financial_income'] - calc['financial_costs']
        
        calc['appropriations'] = sum_accounts(accounts, 8800, 8899)
        calc['profit_before_tax'] = calc['profit_after_financial_items'] + calc['appropriations']
        
        # NYTT: Beräkningar för nya bokslutsdispositioner och skatter
        calc['received_group_contributions'] = sum_accounts(accounts, 8810, 8819)  # Erhållna koncernbidrag
        calc['given_group_contributions'] = abs(sum_accounts(accounts, 8820, 8829))  # Lämnade koncernbidrag (kostnad)
        calc['change_over_depreciations'] = sum_accounts(accounts, 8830, 8839)  # Förändring av överavskrivningar
        calc['other_taxes'] = abs(sum_accounts(accounts, 8920, 8929))  # Övriga skatter (kostnad)
        
        # RÄTTA: Skatt-intervall till 8910-8919 (matchar din SIE och tidigare debug)
        calc['tax'] = abs(sum_accounts(accounts, 8910, 8919))
        
        # DEBUG för skatt
        print(f"DEBUG tax calculation: sum_accounts(8910, 8919) = {sum_accounts(accounts, 8910, 8919)}, abs = {calc['tax']}", file=sys.stderr)
        
        calc['profit_loss'] = calc['profit_before_tax'] - calc['tax']

        # --- Balansräkning ---
        # Tillgångar är positiva. Eget kapital och skulder är negativa i SIE. Vi gör dem positiva.
        calc['fixed_assets_tangible'] = sum_accounts(accounts, 1100, 1299)
        calc['fixed_assets_financial'] = sum_accounts(accounts, 1300, 1399)
        calc['total_fixed_assets'] = calc['fixed_assets_tangible'] + calc['fixed_assets_financial']
        
        calc['inventory'] = sum_accounts(accounts, 1400, 1499)
        calc['current_receivables'] = sum_accounts(accounts, 1500, 1799)
        calc['cash_and_bank'] = sum_accounts(accounts, 1900, 1999)
        calc['total_current_assets'] = calc['inventory'] + calc['current_receivables'] + calc['cash_and_bank']
        calc['total_assets'] = calc['total_fixed_assets'] + calc['total_current_assets']
        
        calc['restricted_equity'] = abs(sum_accounts(accounts, 2080, 2089))
        # Fritt eget kapital inkluderar balanserat resultat (2091) och årets resultat (2099)
        balanserat_resultat_fg_ar = abs(sum_accounts(accounts, 2091, 2098))
        
        # KORRIGERING: Använd det faktiska, beräknade resultatet från resultaträkningen.
        # Värdet på konto 2099 är bara giltigt för föregående år, inte för det innevarande.
        arets_resultat_rr = calc['profit_loss']
        
        calc['free_equity_retained'] = balanserat_resultat_fg_ar
        calc['profit_loss_for_equity'] = arets_resultat_rr # Använd värdet från resultaträkningen
        
        # KORRIGERING: Totala egna kapitalet är summan av bundet och fritt (inkl. årets resultat från RR)
        calc['total_equity'] = calc['restricted_equity'] + calc['free_equity_retained'] + calc['profit_loss_for_equity']

        calc['untaxed_reserves'] = abs(sum_accounts(accounts, 2100, 2199))
        calc['long_term_liabilities'] = abs(sum_accounts(accounts, 2300, 2399))
        calc['current_liabilities'] = abs(sum_accounts(accounts, 2400, 2999))
        calc['total_liabilities'] = calc['long_term_liabilities'] + calc['current_liabilities']
        
        calc['total_equity_and_liabilities'] = calc['total_equity'] + calc['untaxed_reserves'] + calc['total_liabilities']
        
        # NYTT: Beräkna soliditet enligt branschpraxis (FAR/BFN)
        try:
            equity = calc.get('total_equity', 0)
            untaxed_reserves = calc.get('untaxed_reserves', 0)
            total_assets = calc.get('total_assets', 0)
            adjusted_equity = equity + untaxed_reserves * (1 - 0.206)
            if total_assets > 0:
                calc['solvency_ratio'] = round((adjusted_equity / total_assets) * 100, 1)
            else:
                calc['solvency_ratio'] = 0.0
        except Exception:
            calc['solvency_ratio'] = 0.0 # Sätt ett standardvärde om något går fel

        return calc

    # Kör beräkningarna för båda åren
    current_calc = calculate_for_year(current_year_accounts)
    prev_calc = calculate_for_year(previous_year_accounts)

    # --- Strukturera slutgiltigt resultat ---
    # Sortera aktiva noter efter deras referensnummer
    # KORRIGERING: Ta bort den felaktiga, ofullständiga och dubblerade 'result'-definitionen.
    # Den korrekta och fullständiga definitionen finns nedan.

    result = {
        "income_statement": {
            "net_sales": create_item(current_calc['net_sales'], prev_calc['net_sales']),
            "other_operating_income": create_item(current_calc['other_operating_income'], prev_calc['other_operating_income']),
            "total_operating_income": create_item(current_calc['total_operating_income'], prev_calc['total_operating_income']),
            "raw_materials": create_item(current_calc['raw_materials'], prev_calc['raw_materials']),
            "other_external_costs": create_item(current_calc['other_external_costs'], prev_calc['other_external_costs']),
            "personnel_costs": create_item(current_calc['personnel_costs'], prev_calc['personnel_costs'], note_trigger_key='personnel_costs'),
            "depreciation": create_item(current_calc['depreciation'], prev_calc['depreciation']),
            "other_operating_expenses": create_item(current_calc['other_operating_expenses'], prev_calc['other_operating_expenses']),
            "total_operating_expenses": create_item(current_calc['total_operating_expenses'], prev_calc['total_operating_expenses']),
            "operating_profit": create_item(current_calc['operating_profit'], prev_calc['operating_profit']),
            "financial_income": create_item(current_calc['financial_income'], prev_calc['financial_income']),
            "financial_costs": create_item(current_calc['financial_costs'], prev_calc['financial_costs']),
            "financial_total": create_item(current_calc.get('financial_total', 0), prev_calc.get('financial_total', 0)),
            "profit_after_financial_items": create_item(current_calc['profit_after_financial_items'], prev_calc['profit_after_financial_items']),
            "appropriations": create_item(current_calc['appropriations'], prev_calc['appropriations']),
            # NYTT: Lägg till nya fält i income_statement
            "received_group_contributions": create_item(current_calc.get('received_group_contributions', 0), prev_calc.get('received_group_contributions', 0)),
            "given_group_contributions": create_item(current_calc.get('given_group_contributions', 0), prev_calc.get('given_group_contributions', 0)),
            "change_over_depreciations": create_item(current_calc.get('change_over_depreciations', 0), prev_calc.get('change_over_depreciations', 0)),
            "other_taxes": create_item(current_calc.get('other_taxes', 0), prev_calc.get('other_taxes', 0)),
            "profit_before_tax": create_item(current_calc['profit_before_tax'], prev_calc['profit_before_tax']),
            "tax": create_item(current_calc['tax'], prev_calc['tax']),
        },
        "balance_sheet": {
            "fixed_assets_tangible": create_item(current_calc['fixed_assets_tangible'], prev_calc['fixed_assets_tangible'], note_trigger_key='fixed_assets_tangible'),
            "fixed_assets_financial": create_item(current_calc['fixed_assets_financial'], prev_calc['fixed_assets_financial']),
            "total_fixed_assets": create_item(current_calc['total_fixed_assets'], prev_calc['total_fixed_assets']),
            "inventory": create_item(current_calc['inventory'], prev_calc['inventory']),
            "current_receivables": create_item(current_calc['current_receivables'], prev_calc['current_receivables']),
            "cash_and_bank": create_item(current_calc['cash_and_bank'], prev_calc['cash_and_bank']),
            "total_current_assets": create_item(current_calc['total_current_assets'], prev_calc['total_current_assets']),
            "restricted_equity": create_item(current_calc['restricted_equity'], prev_calc['restricted_equity']),
            "free_equity_retained": create_item(current_calc['free_equity_retained'], prev_calc['free_equity_retained']),
            "profit_loss_for_equity": create_item(current_calc['profit_loss_for_equity'], prev_calc['profit_loss_for_equity']),
            "total_equity": create_item(current_calc['total_equity'], prev_calc['total_equity']),
            "untaxed_reserves": create_item(current_calc['untaxed_reserves'], prev_calc['untaxed_reserves']),
            "long_term_liabilities": create_item(current_calc['long_term_liabilities'], prev_calc['long_term_liabilities'], note_trigger_key='long_term_liabilities'),
            "current_liabilities": create_item(current_calc['current_liabilities'], prev_calc['current_liabilities']),
            "total_liabilities": create_item(current_calc['total_liabilities'], prev_calc['total_liabilities']),
            # KORRIGERING: Flytta in 'solvency_ratio' så att den blir en del av 'balance_sheet'.
            "solvency_ratio": create_item(current_calc['solvency_ratio'], prev_calc['solvency_ratio']),
        },
        "profit_loss": create_item(current_calc['profit_loss'], prev_calc['profit_loss']),
        "total_assets": create_item(current_calc['total_assets'], prev_calc['total_assets']),
        "total_equity_and_liabilities": create_item(current_calc['total_equity_and_liabilities'], prev_calc['total_equity_and_liabilities']),
        "balance_check": create_item(current_calc['total_assets'] - current_calc['total_equity_and_liabilities'], prev_calc['total_assets'] - prev_calc['total_equity_and_liabilities']),
        
        # KORRIGERING: Ta bort denna rad. Det är en felplacerad dubblett av en nyckel
        # som redan finns inuti "income_statement" och som förstör hela datastrukturen.
        # "personnel_costs": create_item(current_calc['personnel_costs'], prev_calc['personnel_costs'], note_trigger_key='personnel_costs'),
    }

    # DEBUG: skriv ut income_statement som skickas till frontend
    try:
        print("DEBUG income_statement:", json.dumps(result["income_statement"], ensure_ascii=False))
    except Exception as e:
        print("DEBUG income_statement dump failed:", str(e))

    sorted_active_notes = dict(sorted(active_notes.items(), key=lambda item: item[1]['ref']))
    result["active_notes"] = sorted_active_notes
    
    return result
