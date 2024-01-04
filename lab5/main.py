import sys
import grammar
import parser

def parse_grammar(file):
    grammar = {}
    symbols = set()
    start = None

    for line in file.readlines():
        if not line:
            continue

        rule = line.strip().split("->")
        if len(rule) != 2:
            sys.exit(f'wrong input: {line}')

        lhs = rule[0].strip()
        symbols.add(lhs)

        if not start:
            start = lhs
        
        grammar.setdefault(lhs, set())

        for alt in rule[1].split("|"):
            rhs = tuple(alt.strip().split())
            grammar[lhs].add(rhs)

            for s in rhs:
                symbols.add(s)

    return (grammar, symbols, start)


def main():
    grammar_file = 'grammar.txt'
    input_file = 'input.txt'
    n = -1

    if len(sys.argv) > 1:
        n = int(sys.argv[1])
    if len(sys.argv) > 2:
        grammar_file = sys.argv[2]
    if len(sys.argv) > 3:
        input_file = sys.argv[3]

    with open(input_file) as f:
        input = f.readline().strip()
    
    with open(grammar_file) as f:
        rules, symbols, start = parse_grammar(f)

    g = grammar.Grammar(rules, symbols, start)
    g.fill_first()
    g.fill_follow()

    p = parser.Parser(g)
    p.compute_table()

    print(p.parse(input, n))

if __name__ == '__main__':
    main()
   