import {getRandom} from "./random";

type transitions = string[][];

export interface Automata {
    init: number,
    states: number,
    final: number[],
    alphabet: string[],
    map: transitions,
    reachability: reachability,
}

export enum label {
    empty = '@',
    epsilon = '',
}

export function buildTransitions(map: { [label: string]: number[] }[], stateNum: number): transitions {
    let tr: transitions = [];
    for (let i = 0; i < stateNum; i++) {
        tr[i] = [];
        for (let j = 0; j < stateNum; j++) {
            tr[i][j] = label.empty;
        }
    }


    map.forEach((labels, from) => {
        for (let label in labels) {
            labels[label].forEach(to => {
                tr[from][to] = label;
            })
        }
    });
    return tr;
}

// для удобства reachability[i][j] = j, если j достижима из i
type reachability = number[][];

export function getReachabilityMatrix(automata: Automata): reachability {
    let reach: boolean[][] = [];
    for (let from = 0; from < automata.states; from++) {
        reach[from] = [];
        for (let to = 0; to < automata.states; to++) {
            reach[from][to] = automata.map[from][to] != label.empty;
        }
    }

    for (let k: number = 0; k < automata.states; k++) {
        for (let from: number = 0; from < automata.states; from++) {
            for (let to: number = 0; to < automata.states; to++) {
                reach[from][to] = reach[from][to] || reach[from][k] && reach[k][to];
            }
        }
    }

    let res: number[][] = [];
    for (let from: number = 0; from < automata.states; from++) {
        res[from] = [];
        for (let to: number = 0; to < automata.states; to++) {
            res[from][to] = reach[from][to] ? to : -1;
        }
    }

    return res;
}

export function getPaths(automata: Automata): string[] {
    let path: number[] = getStatesSequence(automata);

    let paths: string[] = [];
    for (let i = 0; i < path.length - 1; i++) {
        paths[i] = getPath(automata, path[i], path[i + 1]);
    }

    return paths;
}

const minSequenceLength = 5;

function getStatesSequence(automata: Automata): number[] {
    let state: number = automata.init;
    let path: number[] = [automata.init];

    let iteration: number = 0;
    do {
        let reachable: number[] = automata.reachability[state].filter(x => x != -1);

        state = reachable[getRandom(0, reachable.length)];

        path.push(state);

        iteration++
    } //while (iteration < minSequenceLength || (iteration > minSequenceLength && automata.final.indexOf(state) == -1));
    while (automata.final.indexOf(state) == -1);

    return path;
}

function getPath(automata: Automata, from: number, to: number): string {
    if (from == to) {
        return automata.map[from][to];
    }

    let parents: { [parent: string]: number } = BFS(automata, from, to),
        res: string = '',
        child: number = to,
        parent: number = parents[child];

    while (parent != from) {
        res = automata.map[parent][child] + res;
        child = parent;
        parent = parents[child];
    }

    res = automata.map[from][child] + res;

    return res;
}

// пока что просто поиск кратчайшего пути
function BFS(automata: Automata, start: number, end: number): { [parent: string]: number } {
    let visited: boolean[] = [];
    let parents: { [parent: string]: number } = {};
    let queue: number[] = [];

    queue.push(start);
    visited[start] = true;

    while (queue.length > 0) {
        let parent: number = Number(queue.shift());

        for (let child: number = 0; child < automata.states; child++) {
            if (automata.map[parent][child] == label.empty) continue;

            if (child == end) {
                parents[child] = parent;
                return parents;
            }

            if (automata.reachability[child][end] == -1) {
                visited[child] = true;
                continue;
            }

            if (!visited[child]) {
                parents[child] = parent;
                visited[child] = true;
                queue.push(child);
            }
        }
    }

    return parents;
}