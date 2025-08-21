import sys
import shlex
from .accounting_data import SieData, Verification, Transaction, DataField, SieIO

class SieParser:
    """Parser för ekonomifiler i .si-format"""

    def __init__(self, file_contents=None):
        if not file_contents:
            raise ValueError("file_contents must be provided.")
        self.file_contents = file_contents
        self.result = None

    def parse(self):
        """Läs in filen och tolka den. Spara tolkade objekt till result."""
        self.result = self._parse_sie(self.file_contents)

    def _parse_sie(self, handle):
        parse_result = SieData()
        current_verification = None

        for line in handle:
            tokens = shlex.split(line)
            if not tokens:
                continue

            tag = tokens[0]
            if tag == '#VER':
                current_verification = Verification(*tokens[1:])
            elif tag == '{':
                pass
            elif tag == '}':
                if current_verification:
                    parse_result.add_data(current_verification)
                    current_verification = None
            elif tag == '#TRANS':
                if current_verification:
                    current_verification.add_trans(self._parse_trans(tokens))
            elif tag.startswith('#'):
                parse_result.add_data(DataField(tokens))

        return parse_result

    @staticmethod
    def _parse_trans(tokens):
        # #TRANS kontonr {objekt} belopp transdat transtext ...
        kontonr = tokens[1]
        objekt = []

        # Find object list, which is enclosed in {}
        obj_start_idx = -1
        obj_end_idx = -1
        for i, token in enumerate(tokens):
            if token.startswith('{'):
                obj_start_idx = i
            if token.endswith('}'):
                obj_end_idx = i
                break

        if obj_start_idx != -1 and obj_end_idx != -1:
            obj_str = ' '.join(tokens[obj_start_idx:obj_end_idx+1])
            objekt = shlex.split(obj_str[1:-1])
            # The rest of the tokens are after the object list
            rest_tokens = tokens[obj_end_idx+1:]
        else:
            # No object list found
            rest_tokens = tokens[2:]

        belopp = rest_tokens[0] if rest_tokens else '0'
        transdat = rest_tokens[1] if len(rest_tokens) > 1 else ''
        transtext = rest_tokens[2] if len(rest_tokens) > 2 else ''

        return Transaction(kontonr, objekt, belopp, transdat, transtext)
