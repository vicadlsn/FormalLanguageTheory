import { Composition, Operation } from "./types"

const W_REGEX = /^w(\^\d)?/

export function createOrdinalFunction(label: string): Operation {
  return {
    operation: '+',
    arguments: [
      {
        operation: '*',
        arguments: [
          {
            operation: '+',
            arguments: [
              {
                operation: '*',
                arguments: [
                  'w',
                  `a_1${label}`
                ]
              },
              `a_2${label}`
            ]
          },
          'x'
        ]
      },
      {
        operation: '+',
        arguments: [
          {
            operation: '*',
            arguments: [
              'w',
              `b_1${label}`
            ]
          },
          `b_2${label}`
        ]
      }]

  }
}

export function composeFunction(function1: Operation, function2: Operation): Operation {
  const result = JSON.parse(JSON.stringify(function1))
  const stack: Operation[] = []
  stack.push(result)

  while (stack.length) {
    const current = stack.pop()
    if (!current) continue
    current.arguments = current.arguments.map(e => {
      if (typeof (e) == 'object') {
        stack.push(e)
        return e
      } else {
        return e == 'x' ? function2 : e
      }
    })
  }

  return result
}

export function unwrapComposition(composition: Composition): Operation {
  const left = createOrdinalFunction(composition.left.label)
  const right = 'label' in composition.right ? createOrdinalFunction(composition.right.label) : unwrapComposition(composition.right)
  return composeFunction(left, right)
}

// a * b * c * (d + e + f) * g
// ((a * b * c * d + a * b * c * e + a * b * c * f)) * g

// a * b * c * (d + e + f)
// (a * b * c * d + a * b * c * e + a * b * c * f)
export function leftDistributing(composition: Operation): boolean {
  const stack: Operation[] = []
  stack.push(composition)
  while (stack.length) {
    const current = stack.pop()
    if (!current) continue
    if (current.operation == '*') {
      const sumIdx = current.arguments.findIndex((e, i) => i > 0 && typeof (e) == 'object' && e.operation == '+')
      if (sumIdx > 0) {
        const beforeSum = current.arguments.slice(0, sumIdx)
        const afterSum = current.arguments.slice(sumIdx + 1)
        const operation = {
          operation: '',
          arguments: []
        } as Operation
        operation.operation = '+'
        const sum = current.arguments[sumIdx] as Operation
        operation.arguments = sum.arguments.map(e => {
          if (typeof (e) == 'object' && e.operation == '*')
            return {
              operation: '*',
              arguments: [...beforeSum, ...e.arguments]
            } as Operation
          return {
            operation: '*',
            arguments: [...beforeSum, e]
          } as Operation
        })
        if (afterSum.length) {
          current.arguments = [operation, ...afterSum]
        } else {
          current.operation = operation.operation
          current.arguments = operation.arguments
        }
        return true
      }
    }
    current.arguments.forEach(e => {
      if (typeof (e) == 'object') {
        stack.push(e)
      }
    })
  }
  return false
}

export function removeOrdinals(composition: Operation) {
  const stack: Operation[] = []
  stack.push(composition)
  while (stack.length) {
    const current = stack.pop()
    if (!current) continue
    let newArgs = current.arguments.filter((v, i, self) =>
      !(i < self.length - 1 &&
        typeof (v) == 'string' && !W_REGEX.test(v) &&
        typeof (self[i + 1]) == 'string' && W_REGEX.test(self[i + 1] as string)))
    while (current.arguments.length != newArgs.length) {
      current.arguments = newArgs
      newArgs = current.arguments.filter((v, i, self) =>
        !(i < self.length - 1 &&
          typeof (v) == 'string' && !W_REGEX.test(v) &&
          typeof (self[i + 1]) == 'string' && W_REGEX.test(self[i + 1] as string)))
    }

    current.arguments.forEach(e => {
      if (typeof (e) == 'object') {
        stack.push(e)
      }
    })
  }
}

export function restructureComposition(composition: Operation) {
  const stack: Operation[] = []
  stack.push(composition)
  while (stack.length) {
    const current = stack.pop()
    if (!current) continue
    current.arguments = current.arguments.map(e =>
      typeof (e) == 'object' && e.arguments.length == 1 ? e.arguments[0] : e
    )
    current.arguments = current.arguments.map(e => typeof (e) == 'object' && e.operation == current.operation ? e.arguments : e).flat(1)
    for (let i = 0; i < current.arguments.length; i++) {
      if (typeof (current.arguments[i]) == 'string' && W_REGEX.test(current.arguments[i] as string)) {
        let j = i + 1
        while (j < current.arguments.length && typeof (current.arguments[j]) == 'string' && W_REGEX.test(current.arguments[j] as string)) {
          j++
        }
        if (j != i + 1) {
          const degree = current.arguments.slice(i, j).map(e => e == 'w' ? 1 : parseInt((e as string).substring(2))).reduce((p, c) => p + c, 0)
          current.arguments[i] = `w^${degree}`
          current.arguments = current.arguments.filter((v, idx) => idx <= i || idx >= j)
        }
      }
    }

    current.arguments.forEach(e => {
      if (typeof (e) == 'object') {
        stack.push(e)
      }
    })
  }
}

// (w + a + b) * c * d
// (w + a) * c * d + b

export function rightDistributing(composition: Operation): boolean {
  const stack: Operation[] = []
  stack.push(composition)
  while (stack.length) {
    const current = stack.pop()
    if (!current) continue

    if (current.operation == '*') {
      const sumArg = current.arguments[0]
      if (typeof (sumArg) == 'object' && sumArg.operation == '+' &&
        (typeof (sumArg.arguments[0]) == 'string' && W_REGEX.test(sumArg.arguments[0]) ||
          (sumArg.arguments[0] as Operation).operation == '*' && !!(sumArg.arguments[0] as Operation).arguments.find(e => typeof (e) == 'string' && W_REGEX.test(e))) &&
        typeof (sumArg.arguments[sumArg.arguments.length - 1]) == 'string' && !W_REGEX.test(sumArg.arguments[sumArg.arguments.length - 1] as string)) {

        const lastCoeff = sumArg.arguments[sumArg.arguments.length - 1]
        sumArg.arguments = sumArg.arguments.slice(0, sumArg.arguments.length - 1)
        const operation = JSON.parse(JSON.stringify(current))
        current.operation = '+'
        current.arguments = [
          operation,
          lastCoeff
        ]
        return true
      }
    }
    current.arguments.forEach(e => {
      if (typeof (e) == 'object') {
        stack.push(e)
      }
    })
  }
  return false
}

export function writeOperation(operation: Operation): string {
  return `(${operation.arguments.map(e => typeof (e) == 'string' ? e : writeOperation(e)).join(` ${operation.operation} `)})`
}

export function pretifyComposition(composition: Operation): Operation {
  console.log('begin    ', writeOperation(composition))
  let done = true
  while (done) {
    done = false
    let step_done = leftDistributing(composition)
    done = done || step_done
    while (step_done) {
      step_done = leftDistributing(composition)
    }

    console.log('left     ', writeOperation(composition))

    removeOrdinals(composition)

    console.log('ordinals ', writeOperation(composition))

    restructureComposition(composition)

    console.log('restruct ', writeOperation(composition))

    step_done = rightDistributing(composition)
    done = done || step_done
    while (step_done) {
      step_done = rightDistributing(composition)
    }

    console.log('right    ', writeOperation(composition))

    removeOrdinals(composition)

    console.log('ordinals ', writeOperation(composition))

    restructureComposition(composition)

    console.log('restruct ', writeOperation(composition))
  }
  return composition
}