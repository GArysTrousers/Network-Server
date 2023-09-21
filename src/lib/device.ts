import { setInterval } from "timers";
import ping from "ping";

export enum DeviceStatus {
  Up,
  Down
}

export interface DeviceInfo {
  name: string;
  ip: string;
  status: DeviceStatus;
}

export class Device {

  name: string;
  ip: string;
  status: DeviceStatus;
  poker: any

  constructor(info: DeviceInfo) {
    this.name = info.name;
    this.ip = info.ip;
    this.status = info.status
    this.poker = this.setPingSelf()
  }

  setPingSelf() {
    const device = this
    return setInterval(() => {
      ping.sys.probe(device.ip, (isAlive: boolean | null, error: unknown) => {
        device.status = isAlive ? DeviceStatus.Up : DeviceStatus.Down;
      })
    }, 2000 + Math.random())
  }

  getStatus() {
    switch (this.status) {
      case DeviceStatus.Up:
        return "Up";
      case DeviceStatus.Down:
          return "Down";
      default:
        return "?"
    }
  }
}