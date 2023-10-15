import * as fs from 'fs'
import config from './config'
import { Automata, Lexem, LexemTypeDict, Tree, TreeTypeDict } from './types'
import { printAutomata } from './automata'

export function clearLog(){
  fs.writeFileSync(config.logPath, '')
}

export function logLexems(lexems: Lexem[], label?: string){
  const lexemsJSON = JSON.stringify(lexems, (key, value) => key == 'type' ? LexemTypeDict[value] : value, 2)
  fs.appendFileSync(config.logPath, `LEXEMS(${label ?? ''}): \n${lexemsJSON}\n\n`)
}

export function logTree(tree: Tree, label?: string){
  const treeJSON = JSON.stringify(tree,(key, value) => key == 'type' ? TreeTypeDict[value] : value, 2)
  fs.appendFileSync(config.logPath, `TREE(${label ?? ''}): \n${treeJSON}\n\n`)
}

export function logAutomata(automata: Automata, label?: string){
  fs.appendFileSync(config.logPath, `AUTOMATA(${label ?? ''}): \n${printAutomata(automata)}\n\n`)
}