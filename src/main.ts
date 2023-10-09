import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { Device, DeviceInfo, DeviceStatus, StatusUpdate } from "./lib/device";
import { Message, MsgType, msg } from "./lib/messaging";
import { Table } from "pixidb";

const dbPath = "C:/temp/network-monitor"
Table.loglevel = 1

const db = {
  maps: new Table<NetworkMap>('maps', dbPath),
  deviceInfo: new Table<DeviceInfo>('device_info', dbPath),
  devices: new Table<Device>('devices', null), //this one will stay in memory
}

for (const device of db.deviceInfo.getAll()) {
  db.devices.set(new Device(device, updateDeviceStatus))
}


const wss = new WebSocketServer({ port: 3001 })
const sockets: WebSocket[] = []

wss.on('connection', (ws, message) => {
  console.log("New Connection");
  sockets.push(ws)
  console.log("Clients connected:", sockets.length);
  ws.on('message', (raw) => {
    let message = JSON.parse(raw.toString()) as Message

    if (message.type === MsgType.SaveMap) {
      let map = message.data as NetworkMap
      db.maps.set(map)
    }
    else if (message.type === MsgType.GetMap) {
      let map = db.maps.getOne(message.data)
      if (map) ws.send(msg(MsgType.Reply, map, message.reply))
      else ws.send(msg(MsgType.Reply, null, message.reply))
    }
    else if (message.type === MsgType.GetDevices) {
      let deviceInfo = db.deviceInfo.getAll()
      ws.send(msg(MsgType.Reply, deviceInfo, message.reply))
    }
    else if (message.type === MsgType.GetDeviceStatus) {
      let map = db.maps.getOne(message.data)
      if (map) {
        let status = db.devices.getAll()
          .filter((v) => (map?.devices))
          .map((v) => ({
            id: v.id,
            status: v.status
          }))
        ws.send(msg(MsgType.Reply, status, message.reply))
      }
      ws.send(msg(MsgType.Reply, null, message.reply))
    }
    else if (message.type === MsgType.SaveDevice) {
      let info = message.data
      if (db.deviceInfo.new(info)) {
        db.devices.new(new Device(info, updateDeviceStatus))
      } else {
        db.deviceInfo.set(info)
        db.devices.removeOne(info.id)
        db.devices.new(new Device(info, updateDeviceStatus))
      }
    }
    else if (message.type === MsgType.DeleteDevice) {
      db.deviceInfo.removeOne(message.data)
      db.devices.removeOne(message.data)
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

function updateDeviceStatus(id: string, status: DeviceStatus) {
  let newStatus = { id, status }
  for (const ws of sockets) {
    ws.send(msg(MsgType.StatusUpdate, newStatus))
  }
}

const server = createServer((req, res) => {
  let html = ""
  for (const d of db.devices.getAll()) {
    html += `${d.id} - ${d.label} - ${d.ip} - ${d.getStatus()}\n`
  }
  res.write(html)
  res.end()
}).listen(3000)


console.log("Webserver Started - http://localhost:3000");
