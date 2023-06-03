import { CommonOperations } from "./pre-processing/CommonOperations";
import { ProcessingPresets } from "./pre-processing/presets";
import * as tf from "@tensorflow/tfjs";

export interface WorkingData {
  data: APIData | DataProcessed | undefined;
  features?: Feature[];
  selectedPreset?: ProcessingPresets;
  model?: tf.Sequential | tf.LayersModel;
  modelHistory?: { loss: number[]; accuracy: number[] };
  modelValidityDataFeatureHash?: string;
  trainingProportion?: number;
  numEpochs?: number;
  testingData?: { features: any[]; labels: number[] };
  trainingData?: { features: any[]; labels: number[] };
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
  [key: string]: number;
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

export type FeatureCalculator = string | CommonFeatureCalculator;

export type FeatureCalculatorFunction = (data: DataPoint[]) => number;
export type CommonFeatureCalculator = {
  op: CommonOperations;
  key: string;
};

export interface TrainingRequestData {
  features: number[][];
  labels: number[];
  model: {
    layers: {
      type: string;
      units: number;
      activation: string;
    }[];
    compile: {
      optimizer: string;
      loss: string;
      metrics?: string[];
    };
    fit: {
      epochs: number;
      batchSize?: number;
    };
  };
}
