import {writeFileSync} from 'fs'
import {RegexGenerator} from './regexGenerator'
import config from "./config"

try {
    let args = process.argv.slice(2).map(x => Number(x));
    startGenerator(...args);
} catch (e) {
    console.error(e);
}

function startGenerator(alphabetSize?: number, starHeight?: number, maxLookaheadsNum?: number, maxLettersNum?: number): void {
    let g: RegexGenerator = new RegexGenerator(alphabetSize, starHeight, maxLookaheadsNum, maxLettersNum);
    let regex: string = g.generate();

    console.log(`generated regex is ${regex}`);
    writeFileSync(config.regexOutput, regex);
}


