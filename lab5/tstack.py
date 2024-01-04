class Stack:
    def __init__(self, i_symbol="", i_state=0, pos=0):
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

    def reduce(self, parent, transitions, lhs, num):
        pos = parent.input_pos

        for _ in range(num):
            parent = parent.prev

        # transitions[state][lhs]=[(SHIFT, dest)]
        next = parent.add_child(lhs, transitions[parent.state][lhs][0][1], pos)
        self.top.append(next)

    def print_tree(self, node, depth):
        print("  "*depth+node.symbol)

        for child in node.children:
            self.print_tree(child, depth+1)

        
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