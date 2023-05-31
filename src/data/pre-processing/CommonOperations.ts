import {
  CommonFeatureCalculator,
  DataPoint,
  Feature,
  FeatureCalculator,
  FeatureCalculatorFunction,
  RecordInstance,
} from "../types";

export enum CommonOperations {
  Mean,
  Max,
  Min,
  Std,
  Peaks,
}

const max = (data: number[]) => {
  let max = data[0];
  for (let i = 1; i < data.length; i++) {
    if (data[i] > max) max = data[i];
  }
  return max;
};

const min = (data: number[]) => {
  let min = data[0];
  for (let i = 1; i < data.length; i++) {
    if (data[i] < min) min = data[i];
  }
  return min;
};

const mean = (data: number[]) => {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += data[i];
  }
  return sum / data.length;
};

const std = (data: number[]) => {
  let m = mean(data);
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += (data[i] - m) ** 2;
  }
  return Math.sqrt(sum / data.length);
};

function highPassFilter(
  data: number[],
  cutoffFrequency: number,
  samplingRate: number
): number[] {
  const RC = 1.0 / (2.0 * Math.PI * cutoffFrequency);
  const dt = 1.0 / samplingRate;
  const alpha = RC / (RC + dt);

  const filteredData: number[] = [];
  let prevFilteredValue = data[0];

  for (let i = 1; i < data.length; i++) {
    const filteredValue = alpha * (prevFilteredValue + data[i] - data[i - 1]);
    filteredData.push(filteredValue);
    prevFilteredValue = filteredValue;
  }

  return filteredData;
}

const countSignificantPeaks = (
  data: number[],
  thresholdPercentage: number
): number => {
  const threshold = (thresholdPercentage / 100) * (max(data) - min(data));
  let numPeaks = 0;

  for (let i = 1; i < data.length - 1; i++) {
    if (
      data[i] > data[i - 1] &&
      data[i] > data[i + 1] &&
      Math.abs(data[i]) > threshold
    ) {
      numPeaks++;
    }
  }

  return numPeaks;
};

export const doCommonOperation = (
  op: CommonOperations,
  key: string,
  record: { data: DataPoint[] }
) => {
  const data = getValueList(record, key);
  switch (op) {
    case CommonOperations.Mean:
      return mean(data);
    case CommonOperations.Max:
      return max(data);
    case CommonOperations.Min:
      return min(data);
    case CommonOperations.Std:
      return std(data);
    case CommonOperations.Peaks:
      const filteredData = highPassFilter(data, 10.0, max(data) * 2);
      return countSignificantPeaks(filteredData, 10);
    default:
      return 0;
  }
};

export const getValueList = (data: { data: DataPoint[] }, key: string) => {
  return data.data
    .map((dataPoint: any) => dataPoint[key])
    .filter((val) => val !== undefined);
};

export const solveFeature = (feature: Feature, record: RecordInstance) => {
  if ((feature.calculate as CommonFeatureCalculator).op !== undefined) {
    const cFC = feature.calculate as CommonFeatureCalculator;
    return doCommonOperation(cFC.op, cFC.key, record);
  } else if (feature.calculate !== undefined) {
    let fn = new Function(
      "data",
      feature.calculate.toString()
    ) as FeatureCalculatorFunction;
    return fn(record.data);
  } else {
    return 0;
  }
};

export const isCommon = (featureCalc: FeatureCalculator) =>
  (featureCalc as CommonFeatureCalculator).op !== undefined;
