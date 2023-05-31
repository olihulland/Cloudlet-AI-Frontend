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
    calculate: {
      op: CommonOperations.Peaks,
      key: "x",
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
    calculate: {
      op: CommonOperations.Peaks,
      key: "y",
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
    calculate: {
      op: CommonOperations.Peaks,
      key: "z",
    },
  },
  {
    name: "sMean",
    description: "Mean strength",
    calculate: {
      op: CommonOperations.Mean,
      key: "s",
    },
  },
];
