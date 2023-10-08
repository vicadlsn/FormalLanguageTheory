import {getRandom} from "./random";

type transitions = string[][][];

export interface Automata {
    start: number,
    states: number,
    finals: number[],
    alphabet: string[],
    transitions: transitions,
}
