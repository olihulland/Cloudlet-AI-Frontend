export interface APIData {
  record_instances: RecordInstance[];
}

export interface RecordInstance {
  data: DataPoint[];
  classification: number;
  deviceID: string;
  uniqueID: string;
}

export interface DataPoint {
  n: number;
}

export interface AccelDataPoint extends DataPoint {
  x: number;
  y: number;
  z: number;
  s: number;
}
