#!/usr/bin/env python3
"""Klasser för att lagra bokföringsdata från en SI-fil"""

from datetime import datetime
from collections import defaultdict
from itertools import takewhile

def _quote(fields, leave_trailing=True):
    if leave_trailing:
        trailing = len(list(takewhile(lambda f: not f, reversed(fields))))
        return _quote(fields[:len(fields)-trailing], False) + ([''] * trailing)
    else:
        return ['"' + str(f) + '"' if ' ' in str(f) or not str(f) else str(f) for f in fields]

def _format_float(num, comma_decimal=False):
    result = format(num, '.2f').rstrip('0').rstrip('.')
    if comma_decimal:
        result = result.replace('.', ',')
    return result

class SieData:
    single_fields = ['#FLAGGA', '#PROGRAM', '#FORMAT', '#GEN', '#SIETYP',
                     '#FNAMN', '#ORGNR']
    needed_fields = ['#FLAGGA', '#PROGRAM', '#FORMAT', '#GEN', '#SIETYP',
                     '#FNAMN', '#KONTO']
    ident_fields = ['#FLAGGA', '#PROGRAM', '#FORMAT', '#GEN', '#SIETYP',
                    '#PROSA', '#FTYP', '#FNR', '#ORGNR', '#BKOD', '#ADRESS',
                    '#FNAMN', '#RAR', '#TAXAR', '#OMFATTN', '#KPTYP',
                    '#VALUTA']
    account_fields = ['#KONTO', '#KTYP', '#ENHET', '#SRU', '#DIM', '#UNDERDIM',
                      '#OBJEKT']
    balance_fields = ['#IB', '#UB', '#OIB', '#OUB', '#RES', '#PSALDO',
                      '#PBUDGET', '#VER']
    control_fields = ["#KSUMMA"]

    def __init__(self):
        self.data = defaultdict(list)

    def __repr__(self):
        fields = (self.ident_fields + self.account_fields + self.balance_fields
                  + self.control_fields)
        res = ''
        for field in fields:
            for line in self.data[field]:
                res += '{}\n'.format(line)
        return res

    def add_data(self, field):
        if field.name in self.single_fields and self.data[field.name]:
            raise ValueError("This field is set already: ", field.name)
        self.data[field.name].append(field)

    def get_data(self, name):
        return self.data[name]

class SieField:
    def __init__(self, name, value):
        self.name = name
        self.value = value
    def name(self):
        return self.name
    def __repr__(self):
        formatting = '{} "{}"' if ' ' in self.value else "{} {}"
        return formatting.format(self.name, self.value)

class DataField(SieField):
    def __init__(self, line):
        self.name = line[0]
        self.data = line[1:]
    def __repr__(self):
        return ' '.join([self.name] + _quote(self.data))

class Verification(SieField):
    def __init__(self, serie, vernr, verdatum, vertext='', regdatum='', sign=''):
        self.name = '#VER'
        self.serie = serie
        self.vernr = vernr
        self.verdatum = MaybeDate(verdatum)
        self.vertext = vertext
        self.regdatum = MaybeDate(regdatum)
        self.sign = sign
        self.trans_list = []
    def __repr__(self):
        quoted = _quote([self.serie, self.vernr, self.verdatum, self.vertext, self.regdatum, self.sign])
        res = '#VER {} {} {} {} {} {}'.format(*quoted)
        res += '\n{\n'
        for trans in self.trans_list:
            res += '   {}\n'.format(trans)
        res += '}'
        return res
    def add_trans(self, trans):
        self.trans_list.append(trans)

class Transaction:
    def __init__(self, kontonr, objekt, belopp, transdat='', transtext='', kvantitet=0.0, sign=''):
        self.kontonr = kontonr
        self.objekt = objekt
        # FIX: hantera kommatecken i SIE-filen
        belopp_str = str(belopp).replace(',', '.')
        self.belopp = float(belopp_str) if belopp_str else 0.0
        kvantitet_str = str(kvantitet).replace(',', '.')
        self.kvantitet = float(kvantitet_str) if kvantitet_str else 0.0
        self.transdat = MaybeDate(transdat)
        self.transtext = transtext
        self.sign = sign
    def __repr__(self):
        kvantitet = _format_float(self.kvantitet) if self.kvantitet else ''
        belopp = _format_float(self.belopp)
        objekt_str = ('{' + ' '.join(self.objekt) + '}') if self.objekt else '{}'
        quoted = _quote([self.kontonr]) + [objekt_str] + _quote([belopp, self.transdat, self.transtext, kvantitet, self.sign])
        return "#TRANS {} {} {} {} {} {} {}".format(*quoted).strip()

class MaybeDate:
    def __init__(self, datestring):
        try:
            self.date = datetime.strptime(str(datestring), "%Y%m%d")
            self.has_date = True
        except (ValueError, TypeError):
            self.date = None
            self.has_date = False
    def __repr__(self):
        if self.date:
            return self.date.strftime("%Y%m%d")
        return ''

class SieIO:
    @staticmethod
    def readSie(filename):
        try:
            with open(filename, 'r', encoding='cp437') as file_handle:
                return file_handle.readlines()
        except UnicodeDecodeError:
            with open(filename, 'r', encoding='utf-8') as file_handle:
                return file_handle.readlines()
    @staticmethod
    def writeSie(sie_data, filename, overwrite=False):
        writemode = 'w' if overwrite else 'x'
        try:
            with open(filename, writemode, encoding='cp437', errors='replace') as file_handle:
                file_handle.write(repr(sie_data))
        except FileExistsError:
            raise Exception(f"Kan inte skriva {filename}, filen finns redan.")
