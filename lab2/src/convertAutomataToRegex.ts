import { label, Automata } from './automata'

type adjacencyMatrix = string[][];

function buildAdjacencyMatrix(automata: Automata): adjacencyMatrix {
    let m: adjacencyMatrix = automata.map.map(line => {
        let l: string[] = line.map(state => state.length == 0 ? label.empty : state.join('|'));
        l.push(label.empty);
        l.push(label.empty);
        return l;
    })

    let startState: string[] = [...Array<string>(automata.states + 2)].map((_, i) => {
        return (i == automata.init) ? label.epsilon : label.empty;
    })

    automata.final.forEach((i) => m[i][automata.states + 1] = label.epsilon);

    let finalState: string[] = [...Array<string>(automata.states + 2)].map(_ => label.empty);

    m.push(startState);
    m.push(finalState);

    return m;
}

export function convertDFAToRegex(automata: Automata) {
    if (automata.final.length == 0) {
        return '';
    }

    let transitions: adjacencyMatrix = buildAdjacencyMatrix(automata);
    for (let i = 0; i < automata.states; i++) {
        eliminateState(transitions, i);
    }

    return '^(' + transitions[automata.states][automata.states + 1] + ')$';
}

type transitionFromOrTo = { [label: number]: string }

function isPresent(transitions: adjacencyMatrix, state: number): boolean {
    return transitions[state].length > 0;
}

function getPredecessors(transitions: adjacencyMatrix, state: number): transitionFromOrTo {
    let tr: transitionFromOrTo = {};

    for (let from = 0; from < transitions.length; from++) {
        if (from != state && isPresent(transitions, from) && transitions[from][state] != label.empty) {
            tr[from] = transitions[from][state];
        }
    }

    return tr;
}

function getSuccessors(transitions: adjacencyMatrix, state: number): transitionFromOrTo {
    let tr: transitionFromOrTo = {};

    for (let to = 0; to < transitions.length; to++) {
        if (to != state && isPresent(transitions, state) && transitions[state][to] != label.empty) {
            tr[to] = transitions[state][to];
        }
    }

    return tr;
}


function getEliminationLabel(psLabel: string, pLabel: string, loopLabel: string, sLabel: string): string {
    (pLabel == label.empty || pLabel == label.epsilon) ? pLabel = '' : pLabel = `(${pLabel})`;
    (sLabel == label.empty || sLabel == label.epsilon) ? sLabel = '' : sLabel = `(${sLabel})`;
    (loopLabel == label.empty || loopLabel == label.epsilon) ? loopLabel = '' : loopLabel = `(${loopLabel})*`;

    psLabel == label.epsilon ? psLabel = '' : (psLabel != label.empty ? psLabel = `(${psLabel})` : psLabel);

    if (pLabel == '' && sLabel == '' && loopLabel == '') {
        return psLabel;
    }

    if (psLabel == label.empty) {
        return pLabel + loopLabel + sLabel;
    }

    return psLabel + '|' + pLabel + loopLabel + sLabel;
}

function eliminateState(transitions: adjacencyMatrix, state: number): void {
    let predecessors: transitionFromOrTo = getPredecessors(transitions, state),
        successors: transitionFromOrTo = getSuccessors(transitions, state),
        loopLabel: string = transitions[state][state];

    for (let p in predecessors) {
        for (let s in successors) {
            transitions[p][s] = getEliminationLabel
                (
                    transitions[Number(p)][Number(s)],
                    predecessors[p],
                    loopLabel,
                    successors[s],
                );
        }
        transitions[p][state] = label.empty;
    }

    transitions[state] = [];
}
