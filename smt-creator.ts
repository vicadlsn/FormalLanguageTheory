import { restructureComposition } from "./ordinal-functions";
import { Operation, Term } from "./types";
import { W_REGEX, writeOperation, writeOperationSMT } from "./utils";

export function getXOrdinal(composition: Operation): Operation | string | undefined {
  const xOperation = composition.arguments.find(e => typeof (e) == 'object' && e.operation == '*' && e.arguments.find(e => e == 'x'))
  if (typeof (xOperation) == 'object') {
    return xOperation.arguments.length == 2 ?
      JSON.parse(JSON.stringify(xOperation.arguments[0])) as Operation | string :
      {
        operation: '*',
        arguments: JSON.parse(JSON.stringify(xOperation.arguments.slice(0, xOperation.arguments.length - 1)))
      } as Operation
  }
  return undefined
}

export function getFreeOrdinal(composition: Operation): Operation | undefined {
  const freeOperations = JSON.parse(JSON.stringify(composition.arguments.filter(e => !(typeof (e) == 'object' && e.operation == '*' && e.arguments.find(e => e == 'x')))))
  return {
    operation: composition.operation,
    arguments: freeOperations
  } as Operation
}

export function compareFunctions(function1: Operation, function2: Operation) {
  const func1XOrdinal = getXOrdinal(function1)
  const func2XOrdinal = getXOrdinal(function2)
  const func1FreeOrdinal = getFreeOrdinal(function1)
  const func2FreeOrdinal = getFreeOrdinal(function2)
  if (!func1XOrdinal){
    throw `Can't find function 1 X ordinal`
  }
  if (!func2XOrdinal){
    throw `Can't find function 2 X ordinal`
  }
  if (!func1FreeOrdinal){
    throw `Can't find function 1 free ordinal`
  }
  if (!func2FreeOrdinal){
    throw `Can't find function 2 free ordinal`
  }

  if(typeof(func1XOrdinal) != 'string') restructureComposition(func1XOrdinal)
  if(typeof(func2XOrdinal) != 'string') restructureComposition(func2XOrdinal)
  restructureComposition(func1FreeOrdinal)
  restructureComposition(func2FreeOrdinal)

  // console.log(typeof(func1XOrdinal) =='string' ? func1XOrdinal : writeOperation(func1XOrdinal))
  // console.log(typeof(func1FreeOrdinal) =='string' ? func1XOrdinal : writeOperation(func1FreeOrdinal))
  // console.log(typeof(func2XOrdinal) =='string' ? func1XOrdinal : writeOperation(func2XOrdinal))
  // console.log(typeof(func2FreeOrdinal) =='string' ? func1XOrdinal : writeOperation(func2FreeOrdinal))

  const normilizeValues = (operation: Operation | boolean): Operation | string => typeof(operation) == 'boolean' ? operation ? 'true' : 'false' : operation

  const greaterXOrdinals = normilizeValues(compareOrdinals(func1XOrdinal, func2XOrdinal, '>'))
  const equalXOrdinals = normilizeValues(compareOrdinals(func1XOrdinal, func2XOrdinal, '='))
  const greaterFreeOrdinals = normilizeValues(compareOrdinals(func1FreeOrdinal, func2FreeOrdinal, '>'))
  const equalFreeOrdinals = normilizeValues(compareOrdinals(func1FreeOrdinal, func2FreeOrdinal, '='))

  const firstCondition = {
    operation: 'and',
    arguments: [
      greaterXOrdinals,
      {
        operation: 'or',
        arguments: [
          greaterFreeOrdinals,
          equalFreeOrdinals
        ]
      }
    ]
  } as Operation
  const secondCondition = {
    operation: 'and',
    arguments: [
      equalXOrdinals,
      greaterFreeOrdinals
    ]
  } as Operation

  return {
    operation: 'or',
    arguments: [
      firstCondition,
      secondCondition
    ]
  } as Operation
}

export function getCoeff(wObj: Operation | string) {
  if (typeof (wObj) == 'string') {
    if (W_REGEX.test(wObj)) {
      return '1'
    } else {
      return wObj
    }
  } else {
    if (wObj.operation == '*') {
      if (typeof (wObj.arguments[0]) == 'string' && W_REGEX.test(wObj.arguments[0])) {
        if (wObj.arguments.length == 2)
          return wObj.arguments[1]
        return {
          operation: '*',
          arguments: wObj.arguments.slice(1)
        }
      }
      return wObj
    }
    return undefined
  }
}

export function getDegree(wObj: Operation | string): number | undefined {
  if (typeof (wObj) == 'string') {
    if (W_REGEX.test(wObj)) {
      return wObj == 'w' ? 1 : parseInt(wObj.substring(2))
    } else {
      return 0
    }
  } else {
    if (wObj.operation == '*') {
      if (typeof (wObj.arguments[0]) == 'string' && W_REGEX.test(wObj.arguments[0])) {
        return wObj.arguments[0] == 'w' ? 1 : parseInt(wObj.arguments[0].substring(2))
      }
      return 0
    }
    return undefined
  }
}

export function getOrdinalCoeffs(ordinal: Operation | string): (string | Operation)[] {
  const coeffs: (string | Operation)[] = []
  if (typeof (ordinal) == 'string') {
    const degree = getDegree(ordinal)
    const coeff = getCoeff(ordinal)
    if (degree != undefined && coeff) {
      coeffs[degree] = coeff
    }
  } else {
    if (ordinal.operation == '+') {
      ordinal.arguments.forEach(e => {
        const degree = getDegree(e)
        const coeff = getCoeff(e)
        if (degree != undefined && coeff) {
          if (coeffs[degree]) {
            if (typeof (coeffs[degree]) == 'string' || (coeffs[degree] as Operation).operation == '*') {
              coeffs[degree] = {
                operation: '+',
                arguments: [
                  coeffs[degree],
                  coeff
                ]
              } as Operation
            } else {
              (coeffs[degree] as Operation).arguments.push(coeff)
            }
          } else {
            coeffs[degree] = coeff
          }
        }
      })
    }
  }
  return coeffs.map(e => e ? e : '0')
}

export function compareOrdinals(ordinal1: Operation | string, ordinal2: Operation | string, compareOperation: string): Operation | boolean {
  const coeffs1 = getOrdinalCoeffs(ordinal1)
  const coeffs2 = getOrdinalCoeffs(ordinal2)
  switch (compareOperation) {
    case '>':
      if (coeffs1.length != coeffs2.length) {
        return coeffs1.length > coeffs2.length
      }
      if (coeffs1.length == 1) {
        return {
          operation: '>',
          arguments: [
            coeffs1[0],
            coeffs1[0]
          ]
        } as Operation
      }
      const result = {
        operation: 'or',
        arguments: []
      } as Operation
      for (let i = coeffs1.length - 1; i >= 0; i--) {
        const degOperation = {
          operation: '>',
          arguments: [
            coeffs1[i],
            coeffs2[i]
          ]
        } as Operation
        if (i == coeffs1.length) {
          result.arguments.push(degOperation)
        } else {
          const equalsOperations = Array.from(Array(coeffs1.length - 1 - i).keys()).map(e => ({
            operation: '=',
            arguments: [
              coeffs1[e + i + 1],
              coeffs2[e + i + 1]
            ]
          } as Operation))
          result.arguments.push({
            operation: 'and',
            arguments: [
              ...equalsOperations,
              degOperation
            ]
          } as Operation)
        }
      }
      return result
    case '=':
      if (coeffs1.length != coeffs2.length) {
        return false
      }
      return {
        operation: 'and',
        arguments: Array.from(Array(coeffs1.length).keys()).map(e => ({
          operation: '=',
          arguments: [
            coeffs1[e],
            coeffs2[e]
          ]
        } as Operation))
      }
    default: return false
  }
}

export function defineVars(terms: Term[]): string{
  return terms.map(e => [
    `(declare-fun a_1${e.label} () Int)`,
    `(declare-fun a_2${e.label} () Int)`,
    `(declare-fun b_1${e.label} () Int)`,
    `(declare-fun b_2${e.label} () Int)`
  ]).flat(1).join('\n\n')
}

export function restrictVars(terms: Term[]): string{
  return terms.map(e => [
    `(assert (> a_1${e.label} 0))`,
    `(assert (> a_2${e.label} 0))`,
    `(assert (> b_1${e.label} 0))`,
    `(assert (> b_2${e.label} 0))`
  ]).flat(1).join('\n\n')
}

export function createSMTRule(function1: Operation, function2: Operation){
  const condition = compareFunctions(function1, function2)
  return `(assert ${writeOperationSMT(condition)})`
}