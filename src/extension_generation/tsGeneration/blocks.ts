import { WorkingData } from "../../data/types";
import { getKeysFromRecordInstance } from "../main";
import { ProcessingPresets } from "../../data/pre-processing/presets";

export const blocksGenerator = (wd: WorkingData) => {
  if (!wd.data?.record_instances[0]) throw new Error("No data");
  const keys = getKeysFromRecordInstance(wd.data.record_instances[0]);

  let presets = `
  ${
    wd.selectedPreset === ProcessingPresets.movement
      ? "//% weight=100"
      : `//% advanced=true
  //% group="Presets - if using custom data points, construct your own using the above blocks"
  //% weight=0`
  }
  ${movementPreset}
`;

  const advanced = `
  //% block="on need to add data point to $recording"
  //% advanced=true
  //% draggableParameters="reporter"
  //% group="For using custom data points"
  export function getInstantDataPoint(handler: (recording: Recording) => void) {
    onShouldAddDataPoint = handler;
  }
  
  //% block="add $dataPoint to $recording"
  //% advanced=true
  //% group="For using custom data points"
  export function addDataPoint(dataPoint: DataPoint, recording: Recording) {
    recording.addDataPoint(dataPoint);
  }
  
  //% block="data point from ${keys.map((key) => `${key} $${key}`).join(" ")}"
  //% advanced=true
  //% group="For using custom data points"
  export function createDataPoint(${keys
    .map((key) => `${key}: number`)
    .join(", ")}): DataPoint {
    return {
      ${keys.map((key) => `${key}: ${key}`).join(",\n      ")}
    };
  }
`;
  return `
${advanced}

${presets}
  
  //% block="generate feature vector from $recording"
  //% blockId=generateFeatureVector
  //% recording.shadow="record"
  export function generateFeatureVector(recording: Recording): number[] {
    return featureVector(recording);
  }

  //% block="record for $dur seconds"
  //% dur.defl=2
  //% blockId=record
  export function record(dur: number) {
    const rec = new Recording();
    const startTime = input.runningTime();
    while ((input.runningTime() - startTime) < (dur*1000)) {
        onShouldAddDataPoint(rec);
        pause(5);
    }
    return rec;
  }
  
  //% shim=predict::predict
  export function _predict(featureVector: string, maxClassNum: number): Classification | PredictionError {
    return -1;
  }
  
  //% block="predict based on feature vector $featureVector"
  export function predict(featureVector: number[]): Classification {
    return _predict(featureVector.join(','), 2);
  }
`;
};

const movementPreset = `//% block="initialise for movement"
  export function setUpForMovement() {
    onShouldAddDataPoint = (recording: Recording) => {
      const dataPoint = {
        x: input.acceleration(Dimension.X),
        y: input.acceleration(Dimension.Y),
        z: input.acceleration(Dimension.Z),
        s: input.acceleration(Dimension.Strength),
      }
      recording.addDataPoint(dataPoint);
    }
  }
`;
