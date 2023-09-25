import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { Device, DeviceStatus } from "./lib/device";
import { Message, MsgType, msg } from "./lib/messaging";

let devices: Device[] = [
  new Device({ id: '8466-web01', ip: '10.128.128.70', status: DeviceStatus.Up }),
  new Device({ id: 'Router', ip: '10.1.1.1', status: DeviceStatus.Up }),
]

let maps = new Map<string, NetworkMap>()

const wss = new WebSocketServer({ port: 3001 })
const sockets:WebSocket[] = []

wss.on('connection', (ws, message) => {
  console.log("New Connection");
  sockets.push(ws)
  console.log("Clients connected:", sockets.length);
  ws.on('message', (raw) => {
    let message = JSON.parse(raw.toString()) as Message

    if (message.type === MsgType.SaveMap) {
      let map = message.data as NetworkMap
      maps.set(map.map_name, map)
    }
    else if (message.type === MsgType.GetMap) {
      let map = maps.get(message.data)
      if (map) ws.send(msg(MsgType.Reply, map, message.reply))
      else ws.send(msg(MsgType.Reply, null, message.reply))
    }
    else if (message.type === MsgType.GetDevices) {
      var deviceInfo = devices.map((v) => ({
        id: v.id,
        ip: v.ip
      }))
      ws.send(msg(MsgType.Reply, deviceInfo, message.reply))
    }

  })
  ws.on('error', (message) => {
    console.log("Error");
  })
  ws.on('close', (message) => {
    console.log("Closed Connection");
    sockets.splice(sockets.indexOf(ws), 1)
    console.log("Clients connected:", sockets.length);
  })
})



const server = createServer((req, res) => {
  let html = ""
  for (const d of devices) {
    html += `${d.id} - ${d.ip} - ${d.getStatus()}\n`
  }
  res.write(html)
  res.end()
}).listen(3000)


console.log("Webserver Started - http://localhost:3000");
