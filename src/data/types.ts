import { CommonOperations } from "./pre-processing/CommonOperations";
import { ProcessingPresets } from "./pre-processing/presets";

export interface WorkingData {
  data: APIData | DataProcessed | undefined;
  features?: Feature[];
  selectedPreset?: ProcessingPresets;
}

export interface APIData {
  record_instances: RecordInstance[];
  microbits: Microbit[];
  classes: ClassInfo[];
}

export interface DataProcessed {
  record_instances: RecordInstanceProcessed[];
  microbits: Microbit[];
  classes: ClassInfo[];
}

export interface ClassInfo {
  id: number;
  name: string;
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

export interface Feature {
  name: string;
  description: string;
  calculate: FeatureCalculator;
}

export type FeatureCalculator =
  | FeatureCalculatorFunction
  | CommonFeatureCalculator;

export type FeatureCalculatorFunction = (data: RecordInstance) => number;
export type CommonFeatureCalculator = {
  op: CommonOperations;
  key: string;
};
