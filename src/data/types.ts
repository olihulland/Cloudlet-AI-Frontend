export interface WorkingData {
  data: APIData | DataProcessed;
}

export interface APIData {
  record_instances: RecordInstance[];
  microbits: Microbit[];
}

export interface DataProcessed {
  record_instances: RecordInstanceProcessed[];
  microbits: Microbit[];
}

export interface Microbit {
  deviceID: string;
  friendlyID: number;
}

export interface RecordInstance {
  data: DataPoint[];
  classification: number;
  deviceID: string;
  uniqueID: string;
}

export interface RecordInstanceProcessed extends RecordInstance {
  featureVector: number[];
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
