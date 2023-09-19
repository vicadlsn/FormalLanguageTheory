import { parseInput } from "./input-parse";
import { createOrdinalFunction, pretifyComposition, unwrapComposition, writeOperation } from "./ordinal-functions";
import { Composition, Data, Operation, Rule, Term } from "./types";

const data = parseInput('input')
console.log(data.terms)
data.rules.forEach(rule => {
  if ('label' in rule.in) {
    console.log(writeOperation(createOrdinalFunction(rule.in.label)))
  } else {
    console.log(writeOperation(pretifyComposition(unwrapComposition(rule.in))))
  }
  console.log(rule.in, rule.out)
})

//((((w * a_1g) + a_2g) * ((((w * a_1f) + a_2f) * x) + ((w * b_1f) + b_2f))) + ((w * b_1g) + b_2g))
//(((((w * a_1g) + a_2g) * ((w * a_1f) + a_2f) * x) + (((w * a_1g) + a_2g) * ((w * b_1f) + b_2f))) + ((w * b_1g) + b_2g))