import { concatAutomata, determAutomata, iterateAutomata, makeAutomata, printAutomata, unionAutomata } from "./automata"
import config from "./config"
import { parse } from "./parser"
import { Automata } from "./types"
import * as fs from 'fs'
import { clearLog, logAutomata } from "./utils"

function main(){
  clearLog()
  const regex = fs.readFileSync(config.inputPath).toString()
  const tree = parse(regex)
  if(!tree) return
  const aut1: Automata = {
    states: 3,
    init: 0,
    final: [2],
    alphabet: ['a', 'b'],
    map: [{'a': [1,2]}, {'b': [2]}, {}]
  }
  const aut2: Automata = {
    states: 2,
    init: 0,
    final: [0, 1],
    alphabet: ['a', 'b'],
    map: [{'a': [1]}, {'b': [1]}]
  }
  
  const a = [0, 1, 2]
  const b = [...a]
  b[1] = 2
  console.log(a, b)
  
  logAutomata(aut1, 'aut1')
  logAutomata(determAutomata(aut1), 'determ')
  logAutomata(aut2, 'aut2')
  logAutomata(determAutomata(aut2), 'determ')

  const union = unionAutomata(aut1, aut2)
  const concat = concatAutomata(aut1, aut2)
  const iterate = iterateAutomata(aut1)
  logAutomata(concat, 'concat')
  logAutomata(determAutomata(concat), 'determ')
  logAutomata(union, 'union')
  logAutomata(determAutomata(union), 'determ')
  logAutomata(iterate, 'iterate')
  logAutomata(determAutomata(iterate), 'determ')
}

main()