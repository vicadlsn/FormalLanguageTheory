class Function:
    def __init__(self, name, k, b):
        self.name = name
        self.A = k
        self.B = b

    def __str__(self):
        return f"{self.name} = ({self.A}) * x + {self.B}"

    def compose(self, other):
        return Function(
            self.name + other.name,
            self.A * other.A,
            self.A * other.B + self.B,
        )

    def monotony(self):
        return f'(and {self.A >= 1} {self.B >= 0})'

    def strict_monotony(self):
        return f'(or {self.A > 1} {self.B > 0})'

    def ge_by_x(self, other):
        return self.A >= other.A

    def ge_by_free_coef(self, other):
        return self.B >= other.B

    def strict_increase(self, other):
        return f'(or {self.A > other.A} {self.B > other.B})'
