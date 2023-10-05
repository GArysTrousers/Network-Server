import { setInterval } from "timers";
import ping from "ping";

export enum DeviceStatus {
  Unknown,
  Up,
  Down
}

export interface StatusUpdate {
  id: string;
  status: DeviceStatus
}

export interface DeviceInfo {
  id: string;
  label: string;
  ip: string;
}

export class Device {

  id: string;
  ip: string;
  status: DeviceStatus;
  poker: any
  onStatusChange: (id: string, status: DeviceStatus) => void

  constructor(info: DeviceInfo, onStatusChange: (id: string, status: DeviceStatus) => void) {
    this.id = info.id;
    this.ip = info.ip;
    this.status = DeviceStatus.Unknown
    this.poker = this.setPingSelf()
    this.onStatusChange = onStatusChange
  }

  setPingSelf() {
    const device = this
    return setInterval(() => {
      ping.sys.probe(device.ip, (isAlive: boolean | null, error: unknown) => {
        let newStatus = isAlive ? DeviceStatus.Up : DeviceStatus.Down;
        if (device.status !== newStatus) device.onStatusChange(device.id, newStatus)
        device.status = newStatus
      })
    }, 2000 + Math.random())
  }

  getStatus() {
    switch (this.status) {
      case DeviceStatus.Unknown:
        return "Unknown"
      case DeviceStatus.Up:
        return "Up";
      case DeviceStatus.Down:
        return "Down";
      default:
        return "?"
    }
  }
}