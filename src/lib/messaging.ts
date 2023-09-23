
export function msg(type: MsgType, data: any, reply: number | null = null) {
  return { type, data, reply }
}

export enum MsgType {
  Reply,
  SaveMap,
  GetMap
}

export interface Message {
  type: MsgType,
  data: any,
  reply: number | null
}
