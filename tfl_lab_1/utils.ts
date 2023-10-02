import { Operation } from "./types";

export const W_REGEX = /^w(\^\d)?/

export function writeOperation(operation: Operation): string {
  return `(${operation.arguments.map(e => typeof (e) == 'string' ? e : writeOperation(e)).join(` ${operation.operation} `)})`
}

export function writeOperationSMT(operation: Operation): string {
  return `(${operation.operation} ${operation.arguments.map(e => typeof (e) == 'string' ? e : writeOperationSMT(e)).join(' ')})`
}