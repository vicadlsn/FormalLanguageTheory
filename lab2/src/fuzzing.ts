import {getRandom} from "./random";

export function fuzzStringFromFragments(fragments: string[]): string {
    let res: string[] = mutatePaths(fragments);
    return res.join('');
}

const deleteSymbol = (fragments: string[]): void => {
    let fragment: number = getRandom(0, fragments.length);
    let s: number = getRandom(0, fragments[fragment].length);

    if (s == fragments[fragment].length - 1) {
        fragments[fragment] = fragments[fragment].slice(0, s);
        return;
    }

    fragments[fragment] = fragments[fragment].slice(0, s) + fragments[fragment].slice(s + 1);
}

const deleteFragment = (fragments: string[]): string[] => {
    return fragments.splice(getRandom(0, fragments.length), 1);
}

const swapFragments = (fragments: string[]): void => {
    if (fragments.length < 2) {
        return;
    }

    let i: number = getRandom(0, fragments.length);
    let j: number;
    do {
        j = getRandom(0, fragments.length);
    } while (j == i);

    [fragments[i], fragments[j]] = [fragments[j], fragments[i]];
}

const swapSymbols = (fragments: string[]): void => {
    if (fragments.filter(s => s.length > 1).length == 0) {
        return;
    }

    let fragment: number;
    do {
        fragment = getRandom(0, fragments.length);
    } while (fragments[fragment].length < 2);

    let i: number = getRandom(0, fragments[fragment].length);
    let j: number;
    do {
        j = getRandom(0, fragments[fragment].length);
    } while (j == i);

    let swapped: string[] = fragments[fragment].split('');
    [swapped[i], swapped[j]] = [swapped[j], swapped[i]];

    fragments[fragment] = swapped.join('');
}

const repeatSymbol = (fragments: string[]): void => {
    let fragment: number = getRandom(0, fragments.length);
    let s: number = getRandom(0, fragments[fragment].length);
    let char: string = fragments[fragment][s];

    if (s == fragments[fragment].length - 1) {
        fragments[fragment] = fragments[fragment] + char;
        return;
    }

    fragments[fragment] = fragments[fragment].slice(0, s) + char + fragments[fragment].slice(s + 1);
}

const repeatFragment = (fragments: string[]): void => {
    let fragment: number = getRandom(0, fragments.length);
    fragments.splice(fragment + 1, 0, fragments[fragment]);
}

const mutators: Function[] = [ deleteFragment, swapFragments, repeatSymbol, swapSymbols, deleteSymbol, repeatFragment];

function mutatePaths(fragments: string[]): string[] {
    let mutated: string[] = [...fragments].filter(s => s.length != 0);

    let count: number = Math.floor(Math.random() * (mutated.length + 1));

    for (let j = 0; j < count; j++) {
        let i: number = getRandom(0, mutators.length);

        if (mutators[i] === deleteFragment) {
            mutated = deleteFragment(mutated);
        } else {
            mutators[i](mutated);
        }
    }

    return mutated;
}