import { PageProps } from "../App";
import { useEffect, useMemo, useState } from "react";
import {
  Center,
  Container,
  Heading,
  Button,
  Text,
  Flex,
  useToast,
  Box,
  Alert,
  AlertIcon,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  Spacer,
} from "@chakra-ui/react";
import * as React from "react";
import * as tf from "@tensorflow/tfjs";
import { DataProcessed, Feature, RecordInstanceProcessed } from "../data/types";
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
import Hashes from "jshashes";
import { useNavigate } from "react-router-dom";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export const ModelTraining = ({
  setStepInfo,
  workingData,
  setWorkingData,
}: PageProps) => {
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
  const [trainingProportion, setTrainingProportion] = useState<number>(0.8);
  const [testingData, setTestingData] = useState<
    { features: any[]; labels: number[] } | undefined
  >(undefined);

  const toast = useToast();
  const navigate = useNavigate();

  const dataFeatureHash = (data: DataProcessed, features: Feature[]) => {
    const MD5 = new Hashes.MD5();
    const combinedStr = JSON.stringify(data) + JSON.stringify(features);
    return MD5.hex(combinedStr);
  };

  useEffect(() => {
    if (
      workingData === undefined ||
      workingData.data === undefined ||
      workingData.data.record_instances.length === 0
    ) {
      navigate("/pre-processing");
    }

    if (
      workingData &&
      workingData.model &&
      workingData.modelHistory &&
      workingData.data &&
      workingData.features &&
      workingData.trainingProportion
    ) {
      const dfh = dataFeatureHash(
        workingData.data as DataProcessed,
        workingData.features
      );
      if (dfh === workingData.modelValidityDataFeatureHash) {
        setModel(workingData.model);
        setModelHistory(workingData.modelHistory);
        setTrainingProportion(workingData.trainingProportion);
      }
    }
  }, []);

  const trainingData = useMemo(() => {
    if (!workingData || workingData.data === undefined) return undefined;
    let features = workingData.data.record_instances.map(
      (instance: any) => instance.featureVector
    );
    let labels = workingData.data.record_instances.map(
      (instance) => instance.classification
    );

    // convert labels to indexes
    let labelsPossible = labels.filter(
      (value, index, self) => self.indexOf(value) === index
    );
    labels = labels.map((label) => labelsPossible.indexOf(label));

    // shuffle
    const data = features.map((feature, index) => {
      return { feature, label: labels[index] };
    });
    tf.util.shuffle(data);
    features = data.map((value) => value.feature);
    labels = data.map((value) => value.label);

    // split into training and testing ensuring that each class is represented
    const numTraining = Math.floor(features.length * trainingProportion);
    let trainFeatures = [];
    let trainLabels = [];
    let testFeatures = [];
    let testLabels = [];

    let idealClassCountForTrain = Math.ceil(
      numTraining / labelsPossible.length
    );
    let trainClassCounts = new Array(labelsPossible.length).fill(0);
    let testClassCounts = new Array(labelsPossible.length).fill(0);
    for (let i = 0; i < features.length; i++) {
      if (
        trainClassCounts[labels[i]] < idealClassCountForTrain &&
        trainLabels.length < numTraining
      ) {
        trainFeatures.push(features[i]);
        trainLabels.push(labels[i]);
        trainClassCounts[labels[i]]++;
      } else {
        testFeatures.push(features[i]);
        testLabels.push(labels[i]);
        testClassCounts[labels[i]]++;
      }
    }

    setTestingData({
      features: testFeatures,
      labels: testLabels,
    });

    return {
      features: trainFeatures,
      labels: trainLabels,
    };
  }, [workingData, trainingProportion]);

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
          setTraining(false);
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
            if (setWorkingData && workingData && workingData.features) {
              setWorkingData({
                ...workingData,
                model: m,
                modelHistory: modelHistory,
                modelValidityDataFeatureHash: dataFeatureHash(
                  workingData.data as DataProcessed,
                  workingData.features
                ),
                trainingProportion: trainingProportion,
                testingData: testingData,
              });
            }
            setTraining(false);
          });
        });
      }
    });
  };

  return (
    <>
      <Container maxWidth="container.xl" px={10}>
        <Heading mb={3}>Model Training</Heading>
        <Heading size="md" mb={2}>
          Training/Test Split
        </Heading>
        <Alert status="info" variant="subtle" m={3} bgColor={"gray.100"}>
          <AlertIcon />
          The data is split into training and test sets. The training set is
          used to train the model, and the test set is used to evaluate the
          model's performance on the next page. Use the slider to adjust the
          proportion of the data that is used for training.
        </Alert>

        <Container maxW={"container.md"}>
          <Flex flexDir={"row"}>
            <Text>Training</Text>
            <Spacer />
            <Text>Testing</Text>
          </Flex>
          <Slider
            aria-label="slider-train-test-split"
            defaultValue={0.8}
            min={0}
            max={1}
            step={0.05}
            onChange={(value) => {
              let min = 0.2;
              if (numClasses && numFeatures) {
                const minPossibleTrainProp =
                  Math.ceil(numClasses / numFeatures / 0.05) * 0.05;
                if (minPossibleTrainProp > min) min = minPossibleTrainProp;
              }
              if (value >= min) setTrainingProportion(value);
              else if (value > trainingProportion) setTrainingProportion(min);
            }}
            value={trainingProportion}
          >
            <SliderTrack>
              <SliderFilledTrack />
            </SliderTrack>
            <SliderThumb />
          </Slider>
          <Flex flexDir={"row"}>
            <Text>
              {Math.round((trainingProportion ?? 0) * 100)}%{" "}
              {workingData && workingData.data
                ? "(" +
                  Math.floor(
                    workingData.data.record_instances.length *
                      (trainingProportion ?? 0)
                  ).toString() +
                  ")"
                : ""}
            </Text>
            <Spacer />
            <Text>
              {Math.round((1 - (trainingProportion ?? 0)) * 100)}%{" "}
              {workingData && workingData.data
                ? "(" +
                  (
                    workingData.data.record_instances.length -
                    Math.floor(
                      workingData.data.record_instances.length *
                        (trainingProportion ?? 0)
                    )
                  ).toString() +
                  ")"
                : ""}
            </Text>
          </Flex>
        </Container>

        <Center m={5}>
          <Button
            colorScheme="green"
            size="lg"
            isLoading={training}
            onClick={trainModel}
          >
            Train Model
          </Button>
        </Center>
        <Box mt={4}>
          <Heading>Model History</Heading>
          {modelHistory ? (
            <>
              <Text my={3}>
                This graph shows the accuracy and loss of the model during
                training based only on the training data. A better model has
                higher accuracy and lower loss. We can't see how this model
                performs on unseen data until we evaluate it on the next page.
              </Text>
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
                      min: 0,
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
                      min: 0,
                      max: 1,
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
            </>
          ) : (
            <Alert status="info" variant="subtle" m={3} bgColor={"gray.100"}>
              <AlertIcon />
              Train a model to see it's training history.
            </Alert>
          )}
        </Box>
      </Container>
    </>
  );
};
