import { Feature, RecordInstance, RecordInstanceProcessed } from "../types";
import * as math from "mathjs";
import { CommonOperations, getValueList } from "./CommonOperations";

export const movementFeatures: Feature[] = [
  {
    name: "xMax",
    description: "Maximum x value",
    calculate: {
      op: CommonOperations.Max,
      key: "x",
    },
  },
  {
    name: "xMin",
    description: "Minimum x value",
    calculate: {
      op: CommonOperations.Min,
      key: "x",
    },
  },
  {
    name: "xStd",
    description: "Standard deviation of x values",
    calculate: {
      op: CommonOperations.Std,
      key: "x",
    },
  },
  {
    name: "xPeaks",
    description: "Number of peaks in x values",
    calculate: (data: RecordInstance) => {
      const mult = 3;
      let xPeaks = 0;
      const xValues = getValueList(data, "x");
      const xMean = math.mean(xValues);
      const xStd = math.std(xValues, "unbiased");
      for (let i = 0; i < xValues.length; i++) {
        const x = xValues[i];
        if (x > xMean + mult * xStd) {
          xPeaks++;
        }
      }
      return xPeaks;
    },
  },
  {
    name: "yMax",
    description: "Maximum y value",
    calculate: {
      op: CommonOperations.Max,
      key: "y",
    },
  },
  {
    name: "yMin",
    description: "Minimum y value",
    calculate: {
      op: CommonOperations.Min,
      key: "y",
    },
  },
  {
    name: "yStd",
    description: "Standard deviation of y values",
    calculate: {
      op: CommonOperations.Std,
      key: "y",
    },
  },
  {
    name: "yPeaks",
    description: "Number of peaks in y values",
    calculate: (data: RecordInstance) => {
      const mult = 3;
      let yPeaks = 0;
      const yValues = getValueList(data, "y");
      const yMean = math.mean(yValues);
      const yStd = math.std(yValues, "unbiased");
      for (let i = 0; i < yValues.length; i++) {
        const y = yValues[i];
        if (y > yMean + mult * yStd) {
          yPeaks++;
        }
      }
      return yPeaks;
    },
  },
  {
    name: "zMax",
    description: "Maximum z value",
    calculate: {
      op: CommonOperations.Max,
      key: "z",
    },
  },
  {
    name: "zMin",
    description: "Minimum z value",
    calculate: {
      op: CommonOperations.Min,
      key: "z",
    },
  },
  {
    name: "zStd",
    description: "Standard deviation of z values",
    calculate: {
      op: CommonOperations.Std,
      key: "z",
    },
  },
  {
    name: "zPeaks",
    description: "Number of peaks in z values",
    calculate: (data: RecordInstance) => {
      const mult = 3;
      let zPeaks = 0;
      const zValues = getValueList(data, "z");
      const zMean = math.mean(zValues);
      const zStd = math.std(zValues, "unbiased");
      for (let i = 0; i < zValues.length; i++) {
        const z = zValues[i];
        if (z > zMean + mult * zStd) {
          zPeaks++;
        }
      }
      return zPeaks;
    },
  },
  {
    name: "meanStrength",
    description: "Mean strength",
    calculate: {
      op: CommonOperations.Mean,
      key: "s",
    },
  },
];
