from ordinals import Ordinal
import linearfunc
import sys


class SRS:
    def __init__(self, filename):
        self.interpretations = {}
        self.compositions = []
        self.inequalities = []

        self.parse_input(filename)
        self.make_inequalities()

    def parse_input(self, file_name):
        with open(file_name) as file:
            for line in file:
                data = line.replace('\n', '').replace('\t', '').replace(' ', '')

                if len(data) == 0:
                    continue

                parts = data.split('->')

                if len(parts) != 2:
                    sys.exit(f'wrong input: {data}')

                rule_left, rule_right = list(parts[0]), list(parts[1])
                self.make_interpretations(rule_left)
                self.make_interpretations(rule_right)
                self.compositions.append([self.make_composition(rule_left), self.make_composition(rule_right)])

    def make_interpretations(self, functions):
        for func in functions:
            if func not in self.interpretations:
                self.interpretations[func] = linearfunc.Function(
                    func,
                    Ordinal(1, "A" + func, "B" + func),
                    Ordinal(1, "C" + func, "D" + func),
                )

    def make_composition(self, rule):
        composition = self.interpretations[rule[-1]]

        for func in rule[-2::-1]:
            composition = self.interpretations[func].compose(composition)

        return composition

    def print(self):
        print("\nINTERPRETATIONS:\n")
        for func in self.interpretations:
            print(self.interpretations[func])

        print("\nCOMPOSITIONS:\n")
        for composition in self.compositions:
            print(f'{composition[0]}   =>  {composition[1]}')

    def make_inequalities(self):
        for _, func in self.interpretations.items():
            self.inequalities.append(func.monotony())
            self.inequalities.append(func.strict_monotony())

        for comp in self.compositions:
            left = comp[0]
            right = comp[1]

            self.inequalities.append(left.ge_by_x(right))
            self.inequalities.append(left.ge_by_free_coef(right))
            self.inequalities.append(left.strict_increase(right))

    def make_smt(self, filename):
        factors = ['A', 'B', 'C', 'D']

        with open(filename, 'w+') as f:
            f.write('(set-logic QF_NIA)\n')

            for func in self.interpretations:
                for factor in factors:
                    f.write(f'(declare-fun {factor + func} () Int)\n')
                    f.write(f'(assert (>= {factor + func} 0))\n')
#
            for inequality in self.inequalities:
                f.write(f'(assert {inequality})\n')

            f.write('(check-sat)\n(get-model)\n')
