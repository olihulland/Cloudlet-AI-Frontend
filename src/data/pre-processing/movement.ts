import { RecordInstance, RecordInstanceProcessed } from "../types";
import * as math from "mathjs";

// TODO: check this and compare to original python implementation
export const preProcessMovement = (
  data: RecordInstance
): RecordInstanceProcessed => {
  // xMax, xMin, xStd, xPeaks, yMax, yMin, yStd, yPeaks, zMax, zMin, zStd, zPeaks, meanStrength

  const xValues = data.data
    .map((dataPoint: any) => dataPoint.x)
    .filter((x) => x !== undefined);
  const yValues = data.data
    .map((dataPoint: any) => dataPoint.y)
    .filter((y) => y !== undefined);
  const zValues = data.data
    .map((dataPoint: any) => dataPoint.z)
    .filter((z) => z !== undefined);
  const sValues = data.data
    .map((dataPoint: any) => dataPoint.s)
    .filter((s) => s !== undefined);

  const xMax = math.max(xValues);
  const xMin = math.min(xValues);
  const xStd = math.std(xValues, "unbiased");

  const yMax = math.max(yValues);
  const yMin = math.min(yValues);
  const yStd = math.std(yValues, "unbiased");

  const zMax = math.max(zValues);
  const zMin = math.min(zValues);
  const zStd = math.std(zValues, "unbiased");

  const meanStrength = math.mean(sValues);

  //calculate number of peaks in x,y,z using mean plus a multiple of the standard deviation
  const mult = 3;
  let xPeaks = 0;
  let yPeaks = 0;
  let zPeaks = 0;
  const xMean = math.mean(xValues);
  const yMean = math.mean(yValues);
  const zMean = math.mean(zValues);
  for (let i = 0; i < xValues.length; i++) {
    const x = xValues[i];
    const y = yValues[i];
    const z = zValues[i];
    if (x > xMean + mult * xStd) {
      xPeaks++;
    }
    if (y > yMean + mult * yStd) {
      yPeaks++;
    }
    if (z > zMean + mult * zStd) {
      zPeaks++;
    }
  }

  const fv = [
    xMax,
    xMin,
    xStd,
    xPeaks,
    yMax,
    yMin,
    yStd,
    yPeaks,
    zMax,
    zMin,
    zStd,
    zPeaks,
    meanStrength,
  ];

  return {
    ...data,
    featureVector: fv,
  };
};
