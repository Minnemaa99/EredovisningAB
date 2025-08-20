#!/usr/bin/env python3
# vim: set fileencoding=utf-8 :
"""Läs in en verifikationsfil i .si-format för att kunna exportera till något
annat format"""

import sys
import shlex

# Use relative imports for use as a module
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
            # Fallback to stdin, though not used in our web app
            self.result = self._parse_sie(sys.stdin)

    def _parse_sie(self, handle):
        self.parse_result = SieData()
        for self.current_line in handle:
            self._parse_next()
        return self.parse_result

    def _parse_next(self):
        tokens = shlex.split(self.current_line)
        if not tokens:
            return

        tag = tokens[0]
        if tag == '#VER':
            self.current_verification = Verification(*tokens[1:])
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
        # This is a simplified transaction parser based on the original's logic
        args = tokens[1:2] # Kontonr

        if len(tokens) < 3:
            return Transaction(*args)

        if tokens[2] == '{}':
            args = args + [[]] + tokens[3:]
        else:
            if tokens[2].startswith('{') and tokens[2].endswith('}'):
                objekt = [tokens[2][1:-1]]
                args = args + [objekt] + tokens[3:]
            elif tokens[2].startswith('{'):
                objekt = [tokens[2][1:]]
                for idx, token in enumerate(tokens[3:]):
                    if token.endswith('}'):
                        objekt.append(token[:-1])
                        args = args + [objekt] + tokens[4+idx:]
                        break
                    else:
                        objekt.append(token)
            else: # No object list
                 args = args + [[]] + tokens[2:]
        return Transaction(*args)
