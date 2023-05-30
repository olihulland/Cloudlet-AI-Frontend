import { TrainingRequestData } from "../types";

export const getMovementModel = (
  features: number[][],
  labels: number[],
  numClasses: number,
  epochs: number
): TrainingRequestData => {
  return {
    features: features,
    labels: labels,
    model: {
      layers: [
        {
          type: "dense",
          units: 20,
          activation: "relu",
        },
        {
          type: "dense",
          units: 10,
          activation: "relu",
        },
        {
          type: "dense",
          units: numClasses,
          activation: "softmax",
        },
      ],
      compile: {
        optimizer: "adam",
        loss: "categorical_crossentropy",
        metrics: ["accuracy"],
      },
      fit: {
        epochs: epochs,
        batchSize: 32,
      },
    },
  };
};
