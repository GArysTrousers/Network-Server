import { createServer } from "http";
import { WebSocketServer } from "ws";
import { Device, DeviceStatus } from "./lib/device";

let devices: Device[] = [
  new Device({ name: '8466-web01', ip: '10.128.128.70', status: DeviceStatus.Up }),
  new Device({ name: 'Router', ip: '10.1.1.1', status: DeviceStatus.Up }),
]

let maps = new Map<string, NetworkMap>()

const wss = new WebSocketServer({ port: 3001 })

wss.on('connection', (ws, message) => {
  console.log("New Connection");
  ws.on('message', (raw) => {
    let message = JSON.parse(raw.toString()) as Message
    console.log(message.data);

    if (message.type === MsgType.SaveMap) {
      let map = message.data as NetworkMap
      maps.set(map.map_name, map)
    }
    else if (message.type === MsgType.GetMap) {
      let m = maps.get(message.data)
      if (m) ws.send(JSON.stringify(msg(MsgType.Reply, m, message.reply)))
      else ws.send(JSON.stringify(msg(MsgType.Reply, null, message.reply)))
    }

  })
  ws.on('error', (message) => {
    console.log("Error");
  })
  ws.on('close', (message) => {
    console.log("Closed Connection");
  })
})



const server = createServer((req, res) => {
  let html = ""
  for (const d of devices) {
    html += `${d.name} - ${d.ip} - ${d.getStatus()}\n`
  }
  res.write(html)
  res.end()
}).listen(3000)

console.log("Webserver Started - http://localhost:3000");

function msg(type: MsgType, data: any, reply: number | null = null) {
  return { type, data, reply }
}

enum MsgType {
  Reply,
  SaveMap,
  GetMap
}

interface Message {
  type: MsgType,
  data: any,
  reply: number | null
}

interface NetworkMap {
  map_name: string;
  rooms: MapRoom[][];
  device: MapDevice[]
}

interface MapRoom {
  global_rect: number[]
}

interface MapDevice {
  device_name: string;
  position: number[];
}