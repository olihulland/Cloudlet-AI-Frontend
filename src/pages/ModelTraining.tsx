import { PageProps } from "../App";
import { useEffect, useMemo, useState } from "react";
import {
  Container,
  Heading,
  Button,
  Flex,
  useToast,
  Box,
} from "@chakra-ui/react";
import * as React from "react";
import * as tf from "@tensorflow/tfjs";
import { RecordInstanceProcessed, TrainingRequestData } from "../data/types";
import { requestTrainModel } from "../data/api";
import { getMovementModel } from "../data/models/movement";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const ModelTraining = ({ setStepInfo, workingData }: PageProps) => {
  useEffect(() => {
    setStepInfo({
      currentPhase: "Model Training",
      nextStep: "/next?",
      prevStep: "/pre-processing",
      allowNext: false,
    });
  }, [setStepInfo]);

  const [training, setTraining] = useState<boolean>(false);
  const [model, setModel] = useState<
    tf.Sequential | tf.LayersModel | undefined
  >(undefined);
  const [modelHistory, setModelHistory] = useState<any>();

  const toast = useToast();

  const [labelsPossible, setLabelsPossible] = useState<number[]>([]);

  const trainingData = useMemo(() => {
    if (!workingData || workingData.data === undefined) return undefined;

    let features = workingData.data.record_instances.map(
      (instance: any) => instance.featureVector
    );
    console.log("features", features);
    let labels = workingData.data.record_instances.map(
      (instance) => instance.classification
    );
    // list of possible labels
    let labelsPossible = labels.filter(
      (value, index, self) => self.indexOf(value) === index
    );
    setLabelsPossible(labelsPossible);
    // replace labels with index of label in labelsPossible
    labels = labels.map((label) => labelsPossible.indexOf(label));
    console.log("labels", labels);

    // combine features and labels into one array
    const data = features.map((feature, index) => {
      return { feature, label: labels[index] };
    });
    // shuffle data randomly
    tf.util.shuffle(data);

    console.log("data", data);

    // split data into features and labels
    features = data.map((value) => value.feature);
    labels = data.map((value) => value.label);

    return {
      features: features,
      labels: labels,
    };
  }, [workingData]);

  const numClasses = useMemo(() => {
    if (!workingData || workingData.data === undefined) return undefined;
    let count = 0;
    let seen: number[] = [];
    workingData.data.record_instances.forEach((instance: any) => {
      if (!seen.includes(instance.classification)) {
        count++;
        seen.push(instance.classification);
      }
    });
    console.log("numClasses", count);
    return count;
  }, [workingData]);

  const numFeatures = useMemo(() => {
    if (!workingData || workingData.data === undefined) return undefined;
    return (workingData.data.record_instances[0] as RecordInstanceProcessed)
      .featureVector.length;
  }, [workingData]);

  const trainModel = async () => {
    if (!trainingData || !numClasses || !numFeatures) {
      console.error("Training data undefined - unable to train");
      return;
    }

    setTraining(true);

    const modelSchema = getMovementModel(
      trainingData.features,
      trainingData.labels,
      numClasses
    );
    requestTrainModel(modelSchema).then((res) => {
      if (res.status < 200 || res.status >= 300) {
        res.text().then((text) => {
          toast({
            title: "Training Error",
            description: text,
            status: "error",
            duration: 5000,
            isClosable: true,
            position: "top",
          });
          console.error(text);
        });
      } else {
        res.json().then((json) => {
          const modelID = json["modelID"];
          const modelHistory = json["history"];
          if (modelID === undefined) {
            throw Error("No modelID");
          }
          tf.loadLayersModel(
            `${process.env.REACT_APP_API_URL}/trained-model/${modelID}/model.json`
          ).then((m) => {
            console.log("set model", m);
            setModel(m);
            setModelHistory(modelHistory);
          });
        });
      }
    });

    setTraining(false);
  };

  const sendModel = async () => {
    if (!model) {
      console.error("Model undefined - unable to send");
      return;
    }
    console.log("sending model");

    await model.save(`${process.env.REACT_APP_API_URL}/model`);

    console.log("model sent");
  };

  const getModelFile = async () => {
    console.log("getting model file");
    const response = await fetch(
      `${process.env.REACT_APP_API_URL}/model-header`
    );
    // get file sent in response
    const blob = await response.blob();
    // create a local URL for it
    const url = window.URL.createObjectURL(blob);
    // and open it in a new tab
    window.open(url);
  };

  return (
    <>
      <Container maxWidth="container.xl" px={10}>
        <Heading>Model Training</Heading>
        <Flex gap={2}>
          <Button
            colorScheme="green"
            size="lg"
            isLoading={training}
            onClick={trainModel}
          >
            Train!
          </Button>
          <Button
            isDisabled={!model}
            onClick={() => {
              if (!model) return;
              const result = model.predict(
                tf.tensor([
                  [
                    2040, -2040, 1417.7388672553543, 0, 2040, -984,
                    824.3757332978387, 0, 2040, -2040, 1521.0920462644638, 0,
                    2129.6180555555557,
                  ],
                ])
              );
              console.log("result 0", result.toString());
            }}
          >
            Predict 0
          </Button>
          <Button
            isDisabled={!model}
            onClick={() => {
              if (!model) return;
              const result = model.predict(
                tf.tensor([
                  [
                    140, 124, 3.6154803433579334, 0, -12, -28,
                    3.961766964913097, 0, -996, -1016, 4.211320472937928, 0,
                    1015.73125,
                  ],
                ])
              );
              console.log("result 1", result.toString());
            }}
          >
            Predict 1
          </Button>
          <Button
            colorScheme="blue"
            size="lg"
            onClick={sendModel}
            disabled={!model}
          >
            Send Model
          </Button>
          <Button colorScheme="orange" size="lg" onClick={getModelFile}>
            Get Model
          </Button>
        </Flex>
        <Box>
          <Heading>Model History</Heading>
          {modelHistory ? (
            <Line
              options={{
                responsive: true,
                scales: {
                  yLoss: {
                    type: "linear" as const,
                    display: true,
                    position: "left" as const,
                    title: {
                      display: true,
                      text: "Loss",
                      color: "darkred",
                    },
                  },
                  yAccuracy: {
                    type: "linear" as const,
                    display: true,
                    position: "right" as const,
                    title: {
                      display: true,
                      text: "Accuracy",
                      color: "darkgreen",
                    },
                  },
                  x: {
                    title: {
                      display: true,
                      text: "Epoch",
                    },
                  },
                },
              }}
              data={{
                labels: modelHistory.loss.map((_: any, n: any) => n + 1),
                datasets: [
                  {
                    label: "Loss",
                    data: modelHistory.loss,
                    borderColor: "red",
                    backgroundColor: "red",
                    yAxisID: "yLoss",
                  },
                  {
                    label: "Accuracy",
                    data: modelHistory.accuracy,
                    borderColor: "green",
                    backgroundColor: "green",
                    yAxisID: "yAccuracy",
                  },
                ],
              }}
            />
          ) : null}
        </Box>
      </Container>
    </>
  );
};
