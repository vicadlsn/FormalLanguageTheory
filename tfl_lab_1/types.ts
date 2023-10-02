export interface Term{
    label: string
  }
  
  export interface Composition{
    left: Term,
    right: Composition | Term
  }
  
  export interface Rule{
    in: Term | Composition
    out: Term | Composition
  }
  
  export interface Data{
    terms: Term[]   // f, g, h
    rules: Rule[]   //
  }
  
  export interface Operation{
    operation: string
    arguments: (string | Operation) []
  }
