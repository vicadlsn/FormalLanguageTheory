export interface Lexem{
  type: LexemType
  value: string
}

export enum LexemType{
  SYMBOL,
  OPEN_BRACKET,
  CLOSE_BRACKET,
  LINE_START,
  LINE_END,
  ITERATION,
  OR,
  LOOKAHEAD_BEGIN
}

export const LexemTypeDict = [
  'SYMBOL',
  'OPEN_BRACKET',
  'CLOSE_BRACKET',
  'LINE_START',
  'LINE_END',
  'ITERATION',
  'OR',
  'LOOKAHEAD_BEGIN'
]

export enum TreeType{
  SYMBOL,
  CONCAT,
  OR,
  ITERATION,
  LOOKAHEAD,
  GROUP,
  EMPTY
}

export const TreeTypeDict = [
  'SYMBOL',
  'CONCAT',
  'OR',
  'ITERATION',
  'LOOKAHEAD',
  'GROUP',
  'EMPTY'
]

export interface Tree{
  type: TreeType
  value: string
  children: Tree[]
}

export interface Automata{
  states: number,
  final: number[],
  init: number
  alphabet: string[]
  map: ({[term: string]: number[]})[]
}