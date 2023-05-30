import * as math from "mathjs";
import {
  CommonFeatureCalculator,
  DataPoint,
  Feature,
  FeatureCalculator,
  FeatureCalculatorFunction,
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
  record: { data: DataPoint[] }
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

export const getValueList = (data: { data: DataPoint[] }, key: string) => {
  return data.data
    .map((dataPoint: any) => dataPoint[key])
    .filter((val) => val !== undefined);
};

export const solveFeature = (
  feature: Feature,
  record: { data: DataPoint[] }
) => {
  if ((feature.calculate as CommonFeatureCalculator).op !== undefined) {
    const cFC = feature.calculate as CommonFeatureCalculator;
    return doCommonOperation(cFC.op, cFC.key, record);
  } else if (feature.calculate !== undefined) {
    let fn = new Function(
      "record",
      feature.calculate.toString()
    ) as FeatureCalculatorFunction;
    return fn(record);
  } else {
    return 0;
  }
};

export const isCommon = (featureCalc: FeatureCalculator) =>
  (featureCalc as CommonFeatureCalculator).op !== undefined;
