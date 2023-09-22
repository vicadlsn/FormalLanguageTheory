import { parseInput } from "./input-parse";
import { createOrdinalFunction, pretifyComposition, unwrapComposition } from "./ordinal-functions";
import { compareFunctions, createSMTRule, defineVars, restrictVars } from "./smt-creator";
import { Composition, Data, Operation, Rule, Term } from "./types";
import { writeOperation } from "./utils";
import * as fs from 'fs';
import * as childProcess from 'child_process'

const z3Path = 'C:/z3/binz3'
const inputPath = 'input'
const smtPath = 'smt.smt'
const outPath = 'out.txt'
const data = parseInput(inputPath)
createSMTFile(smtPath, data)
checkSat()

function createSMTFile(path: string, data: Data){
  const termsSMT = defineVars(data.terms)
  const restrictTerms = restrictVars(data.terms)
  const rulesSMT = data.rules.map(rule => {
    const left = 'label' in rule.in ? createOrdinalFunction(rule.in.label) : pretifyComposition(unwrapComposition(rule.in))
    const right = 'label' in rule.out ? createOrdinalFunction(rule.out.label) : pretifyComposition(unwrapComposition(rule.out))
    return createSMTRule(left, right)
  }).join('\n\n')
  const result = `${termsSMT}\n\n${restrictTerms}\n\n${rulesSMT}\n\n(check-sat)\n\n(get-model)\n\n(exit)`
  fs.writeFileSync(path, result)
}

function checkSat(){
  childProcess.exec(`${z3Path} ${smtPath}`, function(err, data, err_data) {  
    if(err){
      console.log(err_data.toString())
    }
    
    fs.writeFileSync(outPath, data.toString())                     
  })
}