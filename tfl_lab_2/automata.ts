import { Automata, Tree, TreeType } from "./types"

export function makeAutomata(tree: Tree): Automata{
  let links: {
    from: number
    to: number
    tree: Tree
  }[] = []
  links.push({
    from: 0,
    to: 1,
    tree: tree
  })
  while(links.find(l => l.tree.children.length)){
    console.log(links)
    const idx = links.findIndex(l => l.tree.children.length)
    const link = links[idx]
    links = links.filter((_, i) => i != idx)
    if(link.tree.type == TreeType.OR){
      const first = link.tree.children[0]
      const other = link.tree.children.slice(1)
      const otherTree = other.length == 1 ? other[0] : {
        type: TreeType.OR,
        value: '',
        children: other
      }
      if(first.type == TreeType.ITERATION){
        if(link.to > link.from) link.to++
        links.forEach(l => {
          if(l.from > link.from) l.from++
          if(l.to > link.from) l.to++
        })
        links.push({
          from: link.from,
          to: link.from + 1,
          tree: {
            type: TreeType.EMPTY,
            value: '',
            children: []
          }
        })
        links.push({
          from: link.from + 1,
          to: link.from + 1,
          tree: first.children[0]
        })
        links.push({
          from: link.from + 1,
          to: link.to,
          tree: {
            type: TreeType.EMPTY,
            value: '',
            children: []
          }
        })
        links.push({
          from: link.from,
          to: link.to,
          tree: otherTree
        })
        continue
      }
      links.push({
        from: link.from,
        to: link.to,
        tree: first
      })
      links.push({
        from: link.from,
        to: link.to,
        tree: otherTree
      })
    }
    if(link.tree.type == TreeType.CONCAT){
      const first = link.tree.children[0]
      const other = link.tree.children.slice(1)
      const otherTree = other.length == 1 ? other[0] : {
        type: TreeType.CONCAT,
        value: '',
        children: other
      }
      if(first.type == TreeType.ITERATION){
        links.push({
          from: link.from,
          to: link.from,
          tree: first.children[0]
        })
        links.push({
          from: link.from,
          to: link.to,
          tree: otherTree
        })
        continue
      }
      if(link.to > link.from) link.to++ 
      links.forEach(l => {
        if(l.from > link.from) l.from++
        if(l.to > link.from) l.to++
      })

      links.push({
        from: link.from,
        to: link.from + 1,
        tree: first
      })
      links.push({
        from: link.from + 1,
        to: link.to,
        tree: otherTree
      })
    }
  }
  if(links.find(l => l.tree.type != TreeType.SYMBOL && l.tree.type != TreeType.EMPTY)){
    throw Error('Automata Error')
  }
  const alphabet = links.map(l => l.tree.type == TreeType.SYMBOL ? l.tree.value : '').filter((v, i, self) => self.indexOf(v) == i)
  const final = Math.max(...links.map(l => l.from > l.to ? l.from : l.to))
  const init = 0
  const statesCount = final + 1
  const map: number[][] = Array.from(Array(statesCount)).map(e => Array.from(Array(alphabet.length)))
  links.forEach(l => map[l.from][alphabet.findIndex(e => e == l.tree.value)] = l.to)
  return {
    alphabet: alphabet,
    statesCount: statesCount,
    final: final,
    init: init,
    map: map
  }
}

function addLeadingSpaces(e: string, count: number){
  return `${Array.from(Array(count - e.length)).map(e => ' ').join('')}${e}`
}
export function printAutomata(automata: Automata){
  console.log(`      ${automata.alphabet.map(e => addLeadingSpaces(e, 3)).join(' ')}`)
  automata.map.forEach((v, i) => {
    console.log(`${i == automata.init ? 'i' : i == automata.final ? 'f' : ' '} ${addLeadingSpaces(i.toString(), 3)} ${v.map(e => addLeadingSpaces(e == undefined ? ' ' : e.toString(), 3)).join(' ')}`)
  })
}