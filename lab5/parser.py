import tstack 

class Parser:
    def __init__(self, grammar):
        self.grammar = grammar
        self.states = []
        self.initial_state = None
        self.transitions = {}

        self.ACCEPT = "ACCEPT"
        self.SHIFT = "SHIFT"
        self.REDUCE = "REDUCE"

    def print_table(self):
        print("STATES:")
        for i, s in enumerate(self.states):
            print(f'\tI{i}:')
            for item in s:
                print(f'\t\t{str(item)}')
        
        print("TRANSITIONS:")
        for state in self.transitions:
            for symbol in self.transitions[state]:
                for action in self.transitions[state][symbol]:
                    print(f'{state} on {symbol} -> {action}')

    def compute_table(self):
        self.states = []
        
        for r in self.grammar.rules[self.grammar.start]:
            initial = [Item(self.grammar.start, r)]
        
        self.compute_closure(initial)
        
        self.states.append(initial)

        to_process = [initial]
        self.transitions = {0: {}}

        while to_process:
            item_set = to_process.pop()
            current = self.states.index(item_set)
            
            t = {}
            for item in item_set:
                if item.dot_at_the_end():
                    continue
                t.setdefault(item.get_symbol_after_dot(), []).append(item)

            for symbol, items in t.items():
                self.transitions[current].setdefault(symbol, [])

                shift_items = [i.shift_dot() for i in items]
                
                self.compute_closure(shift_items)
                
                new_index = len(self.states)
                if shift_items in self.states:
                    new_index = self.states.index(shift_items)

                if new_index == len(self.states):
                    self.states.append(shift_items)
                    to_process.append(shift_items)
                    self.transitions[new_index] = {}
                    self.compute_reduce(shift_items, new_index)
            
                self.transitions[current][symbol].append((self.SHIFT, new_index))
        

    def compute_reduce(self, item_set, index):
        for item in item_set:
            if not item.dot_at_the_end():
                continue

            if item.lhs == self.grammar.start:
                self.transitions[index]["$"] = [(self.ACCEPT, -1, -1)]
                continue

            for next in self.grammar.follow[item.lhs]:
                self.transitions[index].setdefault(next, []).append((self.REDUCE, item.lhs, item.rhs))

    def compute_closure(self, item_set):
        to_process = [i.get_symbol_after_dot() for i in item_set]

        while to_process:
            nterm = to_process.pop()
            
            if not nterm in self.grammar.rules:
                continue

            for rule in self.grammar.rules[nterm]:
                next = Item(nterm, rule)

                if next not in item_set:
                    item_set.append(next)

                    to_process.append(next.get_symbol_after_dot())

    def parse(self, str, n):
        stack = tstack.Stack("", 0, 0)
        step = 0
        str += "$"

        while True:
            current_top = stack.pop_top_items()

            for cur_state in current_top:
                pos = cur_state.input_pos
                symbol = str[pos]
                
                if symbol not in self.grammar.symbols and symbol != "$":
                    print(f'ERROR: Unexpected symbol at pos {pos}')
                    stack.print(stack.root, 0)
                    return False

                if not symbol in self.transitions[cur_state.state]:
                    cur_state.symbol += " #failed"
                    continue

                actions = self.transitions[cur_state.state][symbol]
                for action in actions:
                    if action[0] == self.ACCEPT:
                        return True

                    if action[0] == self.SHIFT:
                        stack.shift(cur_state, symbol, action[1])
                        continue

                    if action[0] == self.REDUCE:
                        stack.reduce(cur_state, self.transitions, action[1], len(action[2]))

            step += 1
    
            if step == n:
                stack.print_tree(stack.root, 0)
            
            if stack.top_is_empty():
                print(f'ERROR: can\'t proceed further; wrong symbol at pos')
                stack.print()
                return False     
            
            
class Item:
    def __init__(self, lhs, rhs, dot=0):
        self.dot = dot
        self.lhs = lhs
        self.rhs = rhs
    
    def dot_at_the_end(self):
        return self.dot >= len(self.rhs)

    def get_symbol_after_dot(self):
        if self.dot < len(self.rhs):
            return self.rhs[self.dot]
        return ""

    def shift_dot(self):
        new = Item(self.lhs, self.rhs, self.dot)
        if new.dot < len(new.rhs):
            new.dot += 1
        
        return new

    def __eq__(self, other):
        return isinstance(other, Item) and self.lhs == other.lhs and self.rhs == other.rhs and self.dot == other.dot

    def __str__(self):
        s = f'{self.lhs} -> '
        for (i, c) in enumerate(self.rhs):
            if i == self.dot:
                s += '.'
            s += str(c) + " "
        if self.dot_at_the_end():
            s += '.'
        return s            