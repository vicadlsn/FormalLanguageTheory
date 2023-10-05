import { Automata, Tree, TreeType } from "./types"

function addLeadingSpaces(e: string, count: number){
  const spaces = count - e.length
  const rightGap = Math.floor(spaces / 2)
  return `${' '.repeat(spaces - rightGap)}${e}${' '.repeat(rightGap)}`
}

export function printAutomata(automata: Automata){
  const statesLine = `STATES: ${Array.from(Array(automata.states).keys()).join(' ')}`
  const initLine = `INIT: ${automata.init}`
  const finalLine = `FINAL: ${automata.final.join(' ')}`
  const alphabetLine = `ALPHABET: ${automata.alphabet.join(' ')}`
  //размер колонок
  const columnSizes = automata.map.map(e => Math.max(...automata.alphabet.map(symbol => e[symbol] != undefined ? e[symbol].length : 0))).map(e => (e-1)*2 + 1)
  //заголовок (алфавит)
  const header = `TABLE: \n${addLeadingSpaces('\\', (automata.states-1).toString().length)} | ${automata.alphabet.map((e, i) => addLeadingSpaces(e, columnSizes[i])).join(' | ')}`
  //строки таблицы
  const table = automata.map.map((e, j) => {
    const tableLeft = addLeadingSpaces(j.toString(), (automata.states-1).toString().length)
    const tableLine = automata.alphabet.map((symbol, i) => addLeadingSpaces(e[symbol] ? e[symbol].join(',') : '', columnSizes[i])).join(' | ')
    return `${tableLeft} | ${tableLine}`
  })
  return `${statesLine}\n${initLine}\n${finalLine}\n${alphabetLine}\n${header}\n${'-'.repeat(header.length)}\n${table.join('\n')}`
  
}

export function makeAutomata(tree: Tree){
  
}

export function concatAutomata(aut1: Automata, aut2: Automata): Automata{
  const aut2StateConverter = (v: number) => v == aut2.init ? aut1.final : [aut1.states + (v < aut2.init ? v : v - 1)]
  const res_aut: Automata = {
    states: aut1.states + aut2.states - 1,
    init: aut1.init,
    final: aut2.final.map(aut2StateConverter).flat(1),
    alphabet: [...aut1.alphabet, ...aut2.alphabet].filter((v, i, self) => self.indexOf(v) == i),
    map: Array.from(Array(aut1.states + aut2.states - 1,)).map(() => ({ }))
  }
  aut1.map.forEach((e, i) => {
    for(let symbol in e){
      if(!e[symbol]) return
      if(res_aut.map[i][symbol]){
        res_aut.map[i][symbol].push(...e[symbol].filter(v => !res_aut.map[i][symbol].includes(v)))
      }else{
        res_aut.map[i][symbol] = [...e[symbol]]
      }
    }
  })
  aut2.map.forEach((e, i) => {
    const targetLine = aut2StateConverter(i)
    //откуда но в новых кордах
    for(let symbol in e){
      if(!e[symbol]) return
      //куда но в новых кордах
      const targetStates = e[symbol].map(aut2StateConverter).flat(1).filter((v, i, self) => self.indexOf(v) == i)
      //если уже существует массив дописываем новые и наче просто устанавливаем
      targetLine.forEach(targetLineState => {
        if(res_aut.map[targetLineState][symbol]){
          res_aut.map[targetLineState][symbol].push(...targetStates.filter(v => !res_aut.map[targetLineState][symbol].includes(v)))
        }else{
          res_aut.map[targetLineState][symbol] = [...targetStates]
        }
      })
    }
  })
  return res_aut
}

export function unionAutomata(aut1: Automata, aut2: Automata): Automata{
  //если init то берем из первого, иначе дописываем номера состояний по порядку после состояний первого
  const aut2StateConverter = (v: number) => v == aut2.init ? aut1.init : v > aut2.init ? v + aut1.states - 1 : v + aut1.states
  const res_aut: Automata = {
    //сумма, но init общий
    states: aut1.states + aut2.states - 1,
    init: aut1.init,
    //объединение финальных без init
    final: [...aut1.final.filter(e => e != aut1.init), ...aut2.final.filter(e => e != aut2.init).map(aut2StateConverter)],
    //уникальное объединение
    alphabet: [...aut1.alphabet, ...aut2.alphabet].filter((v, i, self) => self.indexOf(v) == i),
    map: Array.from(Array(aut1.states + aut2.states - 1,)).map(() => ({ }))
  }
  //добавляем init в финальные (если хоть где-то он таков)
  if(aut1.final.includes(aut1.init) || aut2.final.includes(aut2.init)) res_aut.final.push(aut1.init)
  //заполняем первый автомат
  aut1.map.forEach((e, i) => {
    for(let symbol in e){
      if(!e[symbol]) return
      //если уже существует массив дописываем новые и наче просто устанавливаем
      if(res_aut.map[i][symbol]){
        res_aut.map[i][symbol].push(...e[symbol].filter(v => !res_aut.map[i][symbol].includes(v)))
      }else{
        res_aut.map[i][symbol] = [...e[symbol]]
      }
    }
  })
  //заполняем второй автомат
  aut2.map.forEach((e, i) => {
    //откуда но в новых кордах
    const targetLine = aut2StateConverter(i)
    for(let symbol in e){
      if(!e[symbol]) return
      //куда но в новых кордах
      const targetStates = e[symbol].map(aut2StateConverter)
      //если уже существует массив дописываем новые и наче просто устанавливаем
      if(res_aut.map[targetLine][symbol]){
        res_aut.map[targetLine][symbol].push(...targetStates.filter(v => !res_aut.map[targetLine][symbol].includes(v)))
      }else{
        res_aut.map[targetLine][symbol] = [...targetStates]
      }
    }
  })
  return res_aut
}

export function iterateAutomata(aut: Automata): Automata{
  const res_aut = JSON.parse(JSON.stringify(aut)) as Automata
  const initMoves = res_aut.map[res_aut.init]
  res_aut.final.forEach(e => {
    res_aut.alphabet.forEach(symbol => {
      if(!initMoves[symbol]) return
      if(res_aut.map[e][symbol]){
        res_aut.map[e][symbol].push(...initMoves[symbol].filter(v => !res_aut.map[e][symbol].includes(v)))
      }else{
        res_aut.map[e][symbol] = [...initMoves[symbol]]
      }
    })
  })
  if(!res_aut.final.includes(res_aut.init)){
    res_aut.final.push(res_aut.init)
  }
  return res_aut
}

export function determAutomata(aut: Automata): Automata{
  //По умолчанию 1 состояние (начальное), алфавит тот же
  const res_aut: Automata = {
    states: 1,
    init: 0,
    final: [],
    alphabet: aut.alphabet,
    map: [{}]
  }
  //словарб состояний (в новом автомате состояния - подмножества (0) - init, (1,2,3) и т.д.)
  const dict: {[state: string]: number} = {}
  dict[aut.init.toString()] = 0

  //состояния на обработку
  const stack: number[][] = [[aut.init]]
  while(stack.length){
    const current = stack.shift()!
    //для каждого символа алфавита
    aut.alphabet.forEach(symbol => {
      //смотрим куда переходят состояния из подмножества
      const statesSet = current.map(e => aut.map[e][symbol]).filter(e => e != undefined).flat(1).filter((v, i, self) => self.indexOf(v) == i)
      if(!statesSet.length) return
      //новое состояние в формате строки (1,2,3)
      const newState = statesSet.join(',')
      //если такого еще не встречали
      if(!dict[newState]){
        //добавляем его в словарь и назначаем ему слудующий номер
        dict[newState] = res_aut.states
        res_aut.map.push({})
        res_aut.states++
        //а также добавляем в очередь обработки
        stack.push(statesSet)
      }
      //формируем переход для символа
      res_aut.map[dict[current.join(',')]][symbol] = [dict[newState]]
    })
  }
  //формируем финальные состояния - все состояния-подмножества, которые содержат хотя бы одно финальное состояние из исходного
  for(let key in dict){
    if(key.split(',').map(e => parseInt(e)).filter(e => aut.final.includes(e)).length){
      res_aut.final.push(dict[key])
    }
  }
  return res_aut
}