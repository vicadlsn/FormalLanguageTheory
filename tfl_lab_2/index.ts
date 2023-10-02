import { makeAutomata, printAutomata } from "./automata"
import config from "./config"
import { parse } from "./parser"
import * as fs from 'fs'

function main(){
  fs.writeFileSync(config.logPath, '')
  const regex = fs.readFileSync(config.inputPath).toString()
  const tree = parse(regex)
  if(!tree) return
}

main()