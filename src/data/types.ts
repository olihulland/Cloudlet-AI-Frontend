export interface WorkingData {
  data: APIData | DataProcessed;
}

export interface APIData {
  record_instances: RecordInstance[];
}

export interface DataProcessed {
  record_instances: RecordInstanceProcessed[];
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
