# backend/app/sie_parser/accounting_data.py

from typing import List, Dict, Any
from datetime import datetime


class SieData:
    def __init__(self) -> None:
        self.accounts: Dict[str, Dict[str, Any]] = {}
        self.verifications: List["Verification"] = []
        self.raw_data: List["DataField"] = []

    # ---------- konton ----------
    def add_account(self, kontonr: str, kontonamn: str) -> None:
        if kontonr not in self.accounts:
            self.accounts[kontonr] = {"name": kontonamn, "balance": 0.0}
        else:
            self.accounts[kontonr]["name"] = kontonamn

    def set_balance(self, kontonr: str, balance: float) -> None:
        if kontonr not in self.accounts:
            self.accounts[kontonr] = {"name": "", "balance": 0.0}
        self.accounts[kontonr]["balance"] = balance

    # ---------- verifikationer ----------
    def add_verification(self, ver: "Verification") -> None:
        self.verifications.append(ver)

    # ---------- rådata ----------
    def add_data(self, data_field: "DataField") -> None:
        self.raw_data.append(data_field)

    def get_data(self, tag: str) -> List["DataField"]:
        return [d for d in self.raw_data if hasattr(d, 'tag') and d.tag == tag]

    # ---------- export ----------
    def get_accounts_list(self) -> List[Dict[str, Any]]:
        return [
            {"account_number": k, "account_name": v["name"], "balance": v["balance"]}
            for k, v in sorted(self.accounts.items(), key=lambda x: int(x[0]))
        ]


class Verification:
    def __init__(
        self,
        serie: str,
        vernr: str,
        verdatum: str,
        vertext: str = "",
        regdatum: str = "",
    ) -> None:
        self.serie = serie
        self.vernr = vernr
        self.verdatum = verdatum
        self.vertext = vertext
        self.regdatum = regdatum
        self.transactions: List["Transaction"] = []

    def add_trans(self, trans: "Transaction") -> None:
        self.transactions.append(trans)


class Transaction:
    def __init__(
        self,
        kontonr: str,
        objekt: List[str],
        belopp: float,
        transdat: str = "",
        transtext: str = "",
    ) -> None:
        self.kontonr = kontonr
        self.objekt = objekt
        self.belopp = belopp
        self.transdat = transdat
        self.transtext = transtext


class DataField:
    def __init__(self, tokens: List[str]) -> None:
        self.tag = tokens[0] if tokens else ""
        self.data = tokens