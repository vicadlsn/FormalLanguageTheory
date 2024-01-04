class Grammar:
    def __init__(self, rules, symbols, start):
        self.rules = rules
        self.symbols = symbols
        self.follow = {}
        self.first = {}

        self.old_start = start
        self.start = start+"'"
        self.rules[self.start] = {(start,)}
        
    def fill_first(self):
        first = {i: set() for i in self.rules}

        changed = True
        while changed:
            changed = False

            for nterm in self.rules:
                prev = len(first[nterm])

                for prod in self.rules[nterm]:
                    symbol = prod[0]

                    if symbol in self.rules:
                        first[nterm] |= first[symbol]
                    else:
                        first[nterm].add(symbol)

                if len(first[nterm]) != prev:
                    changed = True  

        self.first = first

    def fill_follow(self):
        follow = {i: set() for i in self.rules}
        follow[self.old_start].add("$")

        changed = True
        while changed:
            changed = False        
            for nterm in self.rules:
                for prod in self.rules[nterm]:
                    next = follow[nterm]
                    for s in reversed(prod):
                        if s in self.rules:
                            prev = len(follow[s])
                            follow[s] = follow[s].union(next)
                            next = self.first[s]

                            changed |= len(follow[s]) != prev
                        else:
                            next = s

        self.follow = follow
