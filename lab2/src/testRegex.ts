import { readFileSync, writeFileSync } from "fs";
import * as automata from "./automata"
import { convertDFAToRegex } from "./convertAutomataToRegex";
import { fuzzStringFromFragments } from "./fuzzing";
import config from "./config"
import { removeTraps } from "./automata";

try {
    fuzzing();
} catch (e) {
    console.error(e)
}

function fuzzing(): void {
    let aut: automata.Automata = readAutomata(config.automataInput);

    let autToRegex = convertDFAToRegex(aut);
    console.log(`converted automata to regex: ${autToRegex}`);

    fuzzTest(new RegExp(readFileSync(config.regexOutput).toString()), new RegExp(autToRegex), automata.getPaths(aut), 50);
}

function fuzzTest(initialRegex: RegExp, transformedRegex: RegExp, paths: string[], iterations: number) {
    let start: number;
    let initial = paths.join('');
    console.log(`String to match: ${initial}`)

    if (paths.length == 0) {
        console.log('Nothing to test.');
        return;
    }

    type test = { string: string, mutated: string, initResult?: boolean, transformedResult?: boolean, initDuration?: number, transformedDuration?: number };
    let tests: test[] = []
    for (let i = 0; i < iterations; i++) {
        let t: test = { string: initial, mutated: fuzzStringFromFragments(paths) };

        start = performance.now();
        t.initResult = initialRegex.test(t.mutated);
        t.initDuration = performance.now() - start;

        start = performance.now();
        t.transformedResult = transformedRegex.test(t.mutated);
        t.transformedDuration = performance.now() - start;

        tests.push(t);

        console.log(`Mutated: ${t.mutated} 
            initial regex result: ${t.initResult} in ${t.initDuration}ms;
            transformed regex result: ${t.transformedResult} in ${t.transformedDuration}ms`)
    }

    const res = JSON.stringify(tests, null, '\t');
    writeFileSync(config.fuzzingOutput, res);
}

interface inputAutomata { init: number, final: number[], alphabet: string[], states: number, map: { [label: string]: [] }[] }
function readAutomata(fn: string): automata.Automata {
    const jsonStr = readFileSync(fn, 'utf-8');
    const object: inputAutomata = JSON.parse(jsonStr);

    let aut: automata.Automata = {
        init: object.init,
        final: object.final,
        alphabet: object.alphabet,
        states: object.states,
        map: automata.buildTransitions(object.map, object.states),
        reachability: [],
    }

    aut.reachability = automata.getReachabilityMatrix(aut);
    removeTraps(aut);
    return aut;
}
