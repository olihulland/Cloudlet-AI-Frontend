import { Feature, RecordInstance } from "../types";
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
    calculate: `
const mult = 3;
let xPeaks = 0;
const xValues = record.data
  .map((dataPoint) => dataPoint["x"])
  .filter((val) => val !== undefined);
const xMean = xValues.reduce((a, b) => a + b, 0) / xValues.length;
const xStd = Math.sqrt(
  xValues.map((x) => Math.pow(x - xMean, 2)).reduce((a, b) => a + b, 0) /
    xValues.length
);
for (let i = 0; i < xValues.length; i++) {
  const x = xValues[i];
  if (x > xMean + mult * xStd) {
    xPeaks++;
  }
}
return xPeaks;
    `,
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
    calculate: `
const mult = 3;
let yPeaks = 0;
const yValues = record.data
  .map((dataPoint) => dataPoint["y"])
  .filter((val) => val !== undefined);
const yMean = yValues.reduce((a, b) => a + b, 0) / yValues.length;
const yStd = Math.sqrt(
  yValues.map((y) => Math.pow(y - yMean, 2)).reduce((a, b) => a + b, 0) /
    yValues.length
);
for (let i = 0; i < yValues.length; i++) {
  const y = yValues[i];
  if (y > yMean + mult * yStd) {
    yPeaks++;
  }
}
return yPeaks;
`,
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
    calculate: `const mult = 3;
let zPeaks = 0;
const zValues = record.data
  .map((dataPoint) => dataPoint["z"])
  .filter((val) => val !== undefined);
const zMean = zValues.reduce((a, b) => a + b, 0) / zValues.length;
const zStd = Math.sqrt(
  zValues.map((z) => Math.pow(z - zMean, 2)).reduce((a, b) => a + b, 0) /
    zValues.length
);
for (let i = 0; i < zValues.length; i++) {
  const z = zValues[i];
  if (z > zMean + mult * zStd) {
    zPeaks++;
  }
}
return zPeaks;`,
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
