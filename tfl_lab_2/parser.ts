import config from "./config"
import { LexicalAnalyzer } from "./lexical-analyzer"
import { SyntaxAnalyzer } from "./syntax-analyzer"
import { LexemTypeDict, Tree, TreeTypeDict } from "./types"
import * as fs from 'fs'


export function parse(data: string): Tree | undefined{
  try{
    const lexems = new LexicalAnalyzer(data).lexicalAnalyze()
    const tree = new SyntaxAnalyzer(lexems).parse()
    fs.appendFileSync(config.logPath, 'LEXEMS: \n' + JSON.stringify(lexems, (key, value) => key == 'type' ? LexemTypeDict[value] : value, 2) + '\n')
    fs.appendFileSync(config.logPath, 'TREE: \n' + JSON.stringify(tree, (key, value) => key == 'type' ? TreeTypeDict[value] : value, 2) + '\n')
    return tree
  }catch(e){
    console.log((e as Error).message)
    return undefined
  }
}