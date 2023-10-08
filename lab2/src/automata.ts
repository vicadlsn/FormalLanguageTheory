import {getRandom} from "./random";

type transitions = string[][][];

export interface Automata {
    start: number,
    states: number,
    finals: number[],
    alphabet: string[],
    transitions: transitions,
    reachability: reachability,
}

export function buildTransitions(map: { [label: string]: number[] }[], stateNum: number): transitions {
    let tr: transitions = [];
    for (let i = 0; i < stateNum; i++) {
        tr[i] = [];
        for (let j = 0; j < stateNum; j++) {
            tr[i][j] = Array<string>();
        }
    }


    map.forEach((labels, from) => {
        for (let label in labels) {
            labels[label].forEach(to => {
                tr[from][to].push(label);
            })
        }
    });
    return tr;
}

// для удобства reachability[i][j] = j, если j достижима из i
export type reachability = number[][];

export function getReachabilityMatrix(automata: Automata): reachability {
    let reach: boolean[][] = [];
    for (let from = 0; from < automata.states; from++) {
        reach[from] = [];
        for (let to = 0; to < automata.states; to++) {
            if (automata.transitions[from][to].length != 0) {
                reach[from][to] = true;
            }
        }
        reach[from][from] = true;
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

function getStatesSequence(automata: Automata): number[] {
    let state: number = automata.start;
    let path: number[] = [automata.start];

    while (automata.finals.indexOf(state) == -1/*path.length < automata.states-1*/) {
        let reachable: number[] = automata.reachability[state].filter(x => x != -1);

        state = reachable[getRandom(0, reachable.length)];

        path.push(state);
    }

    //path.push(final);

    return path;
}

function getPath(automata: Automata, from: number, to: number): string {
    if (from == to) {
        return getRandomLabel(automata, from, to);
    }

    let parents: { [parent: string]: number } = BFS(automata, from, to),
        res: string = '',
        child: number = to,
        parent: number = parents[child];

    while (parent != from) {
        res = getRandomLabel(automata, parent, child) + res;
        child = parent;
        parent = parents[child];
    }

    res = getRandomLabel(automata, from, child) + res;

    return res;
}

function getRandomLabel(automata: Automata, from: number, to: number): string {
    let labels: string[] = automata.transitions[from][to];
    return labels[getRandom(0, labels.length)] || '';
}

// пока что просто поиск кратчайшего пути
function BFS(automata: Automata, start: number, end: number): { [parent: string]: number } {
    let visited: boolean[] = [];
    let parents: { [parent: string]: number } = {};
    let queue: number[] = [];

    queue.push(start);
    visited[start] = true;

    while (queue.length > 0) {
        let parent: number = queue.shift();

        for (let child: number = 0; child < automata.states; child++) {
            if (automata.transitions[parent][child].length == 0) continue;

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
}