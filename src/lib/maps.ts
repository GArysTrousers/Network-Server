
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