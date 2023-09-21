import { createServer } from "http";
import { WebSocketServer } from "ws";
import { Device, DeviceStatus } from "./lib/device";

let devices: Device[] = [
  new Device({ name: '8466-web01', ip: '10.128.128.70', status: DeviceStatus.Up }),
  new Device({ name: 'Router', ip: '10.1.1.1', status: DeviceStatus.Up }),
]

const wss = new WebSocketServer({ port: 3001 })

wss.on('connection', (ws, message) => {
  console.log("New Connection");
  ws.send('Hey there')
  ws.on('message', (message) => {
    console.log(message);
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
