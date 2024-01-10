import copy

class Stack:
    def __init__(self, i_symbol="S`", i_state=0, pos=0):
        s0 = StackItem(i_symbol, i_state, None, 0)
        self.root = s0
        self.top = [s0]

    def pop_top_items(self):
        top = [i for i in self.top]
        self.top =[]
        return top
    
    def top_is_empty(self):
        return not len(self.top)
    
    def shift(self, parent, symbol, state):
        self.top.append(parent.add_child(symbol, state, parent.input_pos+1))

    def reduce(self, top, transitions, lhs, num):
        if top in top.prev.children:
            top.prev.children.remove(top)
        
        prev = top
        for _ in range(num):
            prev = prev.prev
        next = prev.add_child(lhs, transitions[prev.state][lhs][0][1], top.input_pos)

        self.top.append(next)

    def print(self):
        self.print_tree(self.root, "", 1)

    def print_tree(self, node, indent, last):
        if not node.prev:
            print(node.symbol)
        else:
            print(f'{indent}*- {node.symbol}')

        if last:
            indent += "   "
        else:
            indent += "|  "

        for i, child in enumerate(node.children):
            self.print_tree(child, indent, i== len(node.children)-1)

        
class StackItem:
    def __init__(self, symbol, state, prev, s_pos):
        self.symbol = symbol
        self.state = state
        self.prev = prev
        self.input_pos = s_pos
        self.children = []
    
    def add_child(self, symbol, state, input_pos):
        child = StackItem(symbol, state, self, input_pos)
        self.children.append(child)
        return child

    def __str__(self):
        return f'StackItem {self.symbol}, {self.state}'