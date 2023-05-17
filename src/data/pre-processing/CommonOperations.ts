import * as math from "mathjs";
import {
  CommonFeatureCalculator,
  Feature,
  FeatureCalculatorFunction,
  RecordInstance,
} from "../types";

export enum CommonOperations {
  Mean,
  Max,
  Min,
  Std,
}

export const doCommonOperation = (
  op: CommonOperations,
  key: string,
  record: RecordInstance
) => {
  const data = getValueList(record, key);
  switch (op) {
    case CommonOperations.Mean:
      return math.mean(data);
    case CommonOperations.Max:
      return math.max(data);
    case CommonOperations.Min:
      return math.min(data);
    case CommonOperations.Std:
      return math.std(data, "unbiased");
    default:
      return 0;
  }
};

export const getValueList = (data: RecordInstance, key: string) => {
  return data.data
    .map((dataPoint: any) => dataPoint[key])
    .filter((z) => z !== undefined);
};

export const solveFeature = (feature: Feature, record: RecordInstance) => {
  if ((feature.calculate as CommonFeatureCalculator).op !== undefined) {
    const cFC = feature.calculate as CommonFeatureCalculator;
    return doCommonOperation(cFC.op, cFC.key, record);
  } else {
    return (feature.calculate as FeatureCalculatorFunction)(record);
  }
};
