#!/usr/bin/env python3
# vim: set fileencoding=utf-8 :
"""Läs in en verifikationsfil i .si-format för att kunna exportera till något
annat format"""

import sys
import shlex

from .accounting_data import SieData, Verification, Transaction, DataField
from .accounting_data import SieIO

class SieParser:
    """Parser för ekonomifiler i .si-format"""
    # pylint: disable=too-few-public-methods

    def __init__(self, siefile=None, file_contents=None):
        if not siefile and not file_contents:
            raise ValueError("Either siefile or file_contents must be provided.")
        self.siefile = siefile
        self.file_contents = file_contents
        self.parse_result = None
        self.current_line = None
        self.current_verification = None
        self.result = None

    def parse(self):
        """Läs in filen och tolka den. Spara tolkade objekt till result."""
        if self.file_contents:
            self.result = self._parse_sie(self.file_contents)
        elif self.siefile:
            self.result = self._parse_sie(SieIO.readSie(self.siefile))
        else:
            self.result = self._parse_sie(sys.stdin)

    def write_result(self, filename):
        """Skriv resultatet till en fil, med rätt teckenkodning"""
        SieIO.writeSie(self.result, filename, True)

    def _parse_sie(self, handle):
        self.parse_result = SieData()
        for self.current_line in handle:
            self._parse_next()
        return self.parse_result

    def _parse_next(self):
        # The original library used shlex.split, which doesn't handle some
        # edge cases in SIE files well. We'll use a simpler split.
        tokens = self.current_line.strip().split()
        if not tokens:
            return

        tag = tokens[0]
        if tag == '#VER':
            # Re-join the rest of the line to handle spaces in text fields
            line_content = self.current_line.strip()[len(tag):].strip()
            # shlex is better for parsing the arguments of a VER line
            ver_tokens = shlex.split(line_content)
            self.current_verification = Verification(*ver_tokens)
        elif tag == '{':
            pass
        elif tag == '}':
            if self.current_verification:
                self.parse_result.add_data(self.current_verification)
                self.current_verification = None
        elif tag == '#TRANS':
            if self.current_verification:
                self.current_verification.add_trans(self._parse_trans(tokens))
        elif tag.startswith('#'):
            self.parse_result.add_data(DataField(tokens))
        else:
            pass

    @staticmethod
    def _parse_trans(tokens):
        # This is a simplified transaction parser. The original was complex
        # and hard to adapt. This one assumes a simple structure.
        # #TRANS kontonr {objektlista} belopp transdat transtext

        account_id = tokens[1]

        # Find the content within the curly braces for 'objekt'
        objekt_str = ""
        in_objekt = False
        objekt_list = []
        # Find amount, which is the first token after the closing brace
        amount_index = -1

        temp_tokens = tokens[2:]
        for i, token in enumerate(temp_tokens):
            if token.startswith('{'):
                in_objekt = True
                objekt_str += token[1:]
            elif token.endswith('}'):
                objekt_str += " " + token[:-1]
                in_objekt = False
                amount_index = i + 1
                break
            elif in_objekt:
                objekt_str += " " + token

        if objekt_str:
            objekt_list = objekt_str.strip().split()

        if amount_index != -1 and len(temp_tokens) > amount_index:
            amount = temp_tokens[amount_index]
            # The rest are optional fields
            trans_date = temp_tokens[amount_index + 1] if len(temp_tokens) > amount_index + 1 else ''
            trans_text = temp_tokens[amount_index + 2] if len(temp_tokens) > amount_index + 2 else ''

            return Transaction(account_id, objekt_list, amount, trans_date, trans_text)
        else:
            # Fallback for simpler formats, might not be fully correct
            return Transaction(tokens[1], [], tokens[2], tokens[3] if len(tokens) > 3 else '', tokens[4] if len(tokens) > 4 else '')
