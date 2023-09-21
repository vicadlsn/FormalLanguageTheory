class Ordinal:
    def __init__(self, exp, mul, add):
        self.exp = exp
        self.factor = mul
        self.add = add

    def __str__(self):
        return f"w^{self.exp} * {self.factor} + {self.add}"

    def __add__(self, other):
        if not isinstance(other, Ordinal):
            return Ordinal(self.exp, self.factor, f"(+ {self.add} {other})")

        if self.exp > other.exp:
            return Ordinal(self.exp, self.factor, self.add + other)

        if self.exp == other.exp:
            return Ordinal(self.exp, f"(+ {self.factor} {other.factor})", other.add)

        return other

    def __radd__(self, other):
        return self

    def __mul__(self, other):
        if not isinstance(other, Ordinal):
            return Ordinal(
                self.exp,
                f"(* {self.factor} {other})",
                self.add
            )

        return Ordinal(
            self.exp + other.exp,
            other.factor,
            self.add + self * other.add
        )

    def __gt__(self, other):
        if not isinstance(other, Ordinal):
            add_gt = f'(> {self.add} {other})' if self.exp == 1 else (self.add > other)
            return f'(or (> {self.factor} 0) (and (= {self.factor} 0) {add_gt}))'

        if self.exp < other.exp:
            return f'(and (= {other.factor} 0) {self > other.add})'

        if self.exp > other.exp:
            return f'(or (> {self.factor} 0) (and (= {self.factor} 0) {self.add > other}))'

        factor_gt = f'(> {self.factor} {other.factor})'
        factor_eq = f'(= {self.factor} {other.factor})'
        add_gt = f'(> {self.add} {other.add})' if self.exp == 1 else (self.add > other.add)

        return f'(or {factor_gt} (and {factor_eq} {add_gt}))'

    def __ge__(self, other):
        if not isinstance(other, Ordinal):
            add_ge = f'(>= {self.add} {other})' if self.exp == 1 else (self.add >= other)
            return f'(or (> {self.factor} 0) (and (= {self.factor} 0) {add_ge}))'

        if self.exp < other.exp:
            return f'(and (= {other.factor} 0) {self >= other.add})'

        if self.exp > other.exp:
            return f'(or (> {self.factor} 0) (and (= {self.factor} 0) {self.add >= other}))'

        factor_ge = f'(> {self.factor} {other.factor})'
        factor_eq = f'(= {self.factor} {other.factor})'
        add_ge = f'(>= {self.add} {other.add})' if self.exp == 1 else (self.add >= other.add)

        return f'(or {factor_ge} (and {factor_eq} {add_ge}))'
