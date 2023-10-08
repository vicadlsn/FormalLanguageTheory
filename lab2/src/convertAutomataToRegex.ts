import {label, Automata} from './automata'
import {getRandom} from "./random";

export function convertDFAToRegex(automataToConvert: Automata) {
    let automata: Automata = structuredClone(automataToConvert);
    let prevStart: number = automata.init;
    let startIsFinal: boolean = automata.final.indexOf(automata.init) != -1;

    //let finals: number[] = [...automata.final];

    setNewStart(automata);
    setNewFinal(automata);

    let res: string = ''

    if (startIsFinal) {
        res += '|'
        let loop = automata.map[prevStart][prevStart];
        if ( loop != label.empty) {
            res += loop + '|';
        }
    }

    let states: number[] = [];
    for (let i = 0; i < automata.states - 2; i++) {
        states.push(i);
    }

    while (states.length > 0) {
        eliminateState(automata, Number(states.pop()));
    }

    return '^' + res + automata.map[automata.init][automata.final[0]] + '$';
}

function setNewStart(automata: Automata) {
    for (let i = 0; i < automata.states; i++) {
        automata.map[i].push(label.empty);
    }

    let start: string[] = [];
    for (let i = 0; i < automata.states + 1; i++) {
        start[i] = label.empty;
    }

    if (automata.final.indexOf(automata.init) != -1) {

    }

    automata.map.push(start);
    automata.map[automata.states][automata.init] = label.epsilon;
    automata.init = automata.states;
    automata.states++;
}

function setNewFinal(automata: Automata) {
    for (let i = 0; i < automata.states; i++) {
        automata.map[i].push(label.empty);
    }

    let final: string[] = [];
    for (let i = 0; i < automata.states + 1; i++) {
        final[i] = label.empty;
    }

    for (let i = 0; i < automata.final.length; i++) {
        automata.map[automata.final[i]][automata.states] = label.epsilon;
    }

    automata.map.push(final);
    automata.final = [automata.states];
    automata.states++;
}

type transitions = { [label: number]: string }

function isPresent(automata: Automata, state: number): boolean {
    return automata.map[state].length > 0;
}

function getPredecessors(automata: Automata, state: number): transitions {
    let tr: transitions = {};

    for (let from = 0; from < automata.states; from++) {
        if (from != state && isPresent(automata, from) && automata.map[from][state] != label.empty) {
            tr[from] = automata.map[from][state];
        }
    }

    return tr;
}

function getSuccessors(automata: Automata, state: number): transitions {
    let tr: transitions = {};

    for (let to = 0; to < automata.states; to++) {
        if (to != state && isPresent(automata, state) && automata.map[state][to] != label.empty) {
            tr[to] = automata.map[state][to];
        }
    }

    return tr;
}

function getTransitionsLabel(automata: Automata, from: number, to: number): string {
    return automata.map[from][to];
}

function getEliminationLabel(psLabel: string, pLabel: string, loopLabel: string, sLabel: string): string {
    pLabel == label.empty ? pLabel = '' : (pLabel == label.epsilon ? pLabel = '' : pLabel = `(${pLabel})`);
    sLabel == label.empty ? sLabel = '' : (sLabel == label.epsilon ? sLabel = '' : sLabel = `(${sLabel})`);
    loopLabel == label.empty ? loopLabel = '' : (loopLabel == label.epsilon ? loopLabel = '' : loopLabel = `(${loopLabel})*`);
    psLabel == label.empty ? psLabel = '' : (psLabel == label.epsilon ? psLabel = '' : psLabel);

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
        loopLabel: string = getTransitionsLabel(automata, state, state);

    for (let p in predecessors) {
        for (let s in successors) {
            automata.map[p][s] = getEliminationLabel
            (
                getTransitionsLabel(automata, Number(p), Number(s)),
                predecessors[p],
                loopLabel,
                successors[s],
            );
        }
        automata.map[p][state] = label.empty;
    }

    automata.map[state] = [];
}
