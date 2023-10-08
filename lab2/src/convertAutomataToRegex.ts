import {Automata} from './automata'
import {getRandom} from "./random";

export function convertDFAToRegex(automataToConvert: Automata) {
    let automata: Automata = structuredClone(automataToConvert);
    setNewStart(automata);
    setNewFinal(automata);

    let states: number[] = [];
    for (let i = 0; i < automata.states - 2; i++) {
        states.push(i)
    }

    while (states.length > 0) {
        let state: number = states[getRandom(0, states.length)];
        eliminateState(automata, state);
        states = states.filter(x => x != state);
    }

    return '^' + automata.map[automata.init][automata.final[0]][0] + '$';
}

function setNewStart(automata: Automata) {
    for (let i = 0; i < automata.states; i++) {
        automata.map[i].push([]);
    }

    let start: string[][] = [];
    for (let i = 0; i < automata.states + 1; i++) {
        start[i] = Array<string>();
    }

    automata.map.push(start);
    automata.map[automata.states][automata.init] = [''];
    automata.init = automata.states;
    automata.states++;
}

function setNewFinal(automata: Automata) {
    for (let i = 0; i < automata.states; i++) {
        automata.map[i].push([]);
    }

    let final: string[][] = [];
    for (let i = 0; i < automata.states + 1; i++) {
        final[i] = Array<string>();
    }

    for (let i = 0; i < automata.final.length; i++) {
        automata.map[automata.final[i]][automata.states] = [''];
    }

    automata.map.push(final);
    automata.final = [automata.states];
    automata.states++;
}

type transitions = { [label: number]: string }

function getPredecessors(automata: Automata, state: number): transitions {
    let tr: transitions = {};

    for (let from = 0; from < automata.states; from++) {
        if (from != state && automata.map[from].length != 0 && automata.map[from][state].length != 0) {
            tr[from] = automata.map[from][state].join('|');
        }
    }

    return tr;
}

function getSuccessors(automata: Automata, state: number): transitions {
    let tr: transitions = {};

    for (let to = 0; to < automata.states; to++) {
        if (to != state && automata.map[state].length != 0 && automata.map[state][to].length != 0) {
            tr[to] = automata.map[state][to].join('|');
        }
    }

    return tr;
}

function getTransitionsLabel(automata: Automata, from: number, to: number): string {
    if (automata.map[from][to].length == 0) {
        return '';
    }

    let loop: string = getLoopLabel(automata, from, from);
    if (loop != '') loop = `(${loop})*`
    let tr: string = automata.map[from][to].join('|');
    if (tr != '' && loop != '') tr = `(${tr})`

    return loop + tr;
}

function getLoopLabel(automata: Automata, from: number, to: number): string {
    if (automata.map[from][to].length == 0) {
        return '';
    }
    return automata.map[from][to].join('|');
}

function getEliminationLabel(psLabel: string, pLabel: string, loopLabel: string, sLabel: string): string {
    if (pLabel != '') pLabel = `(${pLabel})`;
    if (sLabel != '') sLabel = `(${sLabel})`;
    if (loopLabel != '') loopLabel = `(${loopLabel})*`

    if (pLabel == '' && sLabel == '' && loopLabel == '') {
        return psLabel;
    }

    if (psLabel == '') {
        return pLabel + loopLabel + sLabel;
    }

    return psLabel + '|' + pLabel + loopLabel + sLabel;
}

function eliminateState(automata: Automata, state: number): void {
    let predecessors: transitions = getPredecessors(automata, state),
        successors: transitions = getSuccessors(automata, state),
        loopLabel: string = getLoopLabel(automata, state, state);

    for (let p in predecessors) {
        for (let s in successors) {
            automata.map[p][s] = [
                getEliminationLabel(
                    getTransitionsLabel(automata, Number(p), Number(s)),
                    predecessors[p],
                    loopLabel,
                    successors[s],
                ),
            ];
        }
        automata.map[p][state] = Array<string>();
    }

    automata.map[state] = Array<Array<string>>();
}
