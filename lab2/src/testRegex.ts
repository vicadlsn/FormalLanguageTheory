import {readFileSync, writeFileSync} from "fs";
import * as automata from "./automata"
import {convertDFAToRegex} from "./convertAutomataToRegex";
import {fuzzStringFromFragments} from "./fuzzing";
import config from "./config"

try {
    fuzzing();
} catch (e) {
    console.error(e)
}
function fuzzing(): void {
    let aut: automata.Automata = readAutomata(config.automataInput);

    let autToRegex = convertDFAToRegex(aut);
    console.log(`converted automata to regex: ${autToRegex}`);

    fuzzTest(new RegExp(readFileSync(config.regexOutput).toString()), new RegExp(autToRegex), automata.getPaths(aut), 5);
}

function fuzzTest(initialRegex: RegExp, transformedRegex: RegExp, paths: string[], iterations: number) {
    let start: number;

    type test = {test: string, initResult?: boolean, transformedResult?: boolean, initDuration?: number, transformedDuration?: number};
    let tests: test[] = []

    for (let i = 0; i < iterations; i++) {
        let t: test = {test: fuzzStringFromFragments(paths)};

        start= performance.now();
        t.initResult = initialRegex.test(t.test);
        t.initDuration = performance.now() - start;

        start = performance.now();
        t.transformedResult = transformedRegex.test(t.test);
        t.transformedDuration = performance.now() - start;

        tests.push(t);

        console.log(`Test: ${t.test} 
            initial regex result: ${t.initResult} in ${t.initDuration}ms;
            transformed regex result: ${t.transformedResult} in ${t.transformedDuration}ms`)
    }

    const res = JSON.stringify(tests, null, '\t');
    writeFileSync(config.fuzzingOutput, res);
}

interface inputAutomata {init: number, final: number[], alphabet: string[], states: number, map: {[label: string]: []}[]}
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

    return aut;
}
