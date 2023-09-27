
interface NetworkMap {
  id: string;
  rooms: MapRoom[][];
  devices: MapDevice[];
  connections: MapConnection[];
}

interface MapRoom {
  global_rect: number[]
}

interface MapDevice {
  device_name: string;
  position: number[];
}

interface MapConnection {
  a: string;
  b: string;
}
