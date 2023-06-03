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
  Accordion,
  AccordionItem,
  AccordionButton,
  NumberInputStepper,
  FormControl,
  NumberDecrementStepper,
  FormHelperText,
  NumberInputField,
  AccordionIcon,
  NumberInput,
  FormLabel,
  AccordionPanel,
  NumberIncrementStepper,
  Select,
  Switch,
  AlertDescription,
  AlertTitle,
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
import { getClassColourScheme } from "../utils/colour";
import { HelpTextContainer } from "../components/HelpTextContainer";
import { ProcessingPresets } from "../data/pre-processing/presets";

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
  const stepInfo = {
    currentPhase: "Model Training",
    nextStep: "/model-evaluation",
    prevStep: "/pre-processing",
    allowNext: false,
  };
  useEffect(() => {
    setStepInfo(stepInfo);
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
  const [numEpochs, setNumEpochs] = useState<number>(60);

  const [preset, setPreset] = useState<ProcessingPresets>();

  const toast = useToast();
  const navigate = useNavigate();

  const [showLoss, setShowLoss] = useState<boolean>(false);

  const [retrievedPreviousData, setRetrievedPreviousData] =
    useState<boolean>(false);

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

    if (workingData && workingData.selectedPreset) {
      setPreset(workingData.selectedPreset);
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
        if (workingData.numEpochs) setNumEpochs(workingData.numEpochs);
        if (setStepInfo) {
          setStepInfo({
            ...stepInfo,
            allowNext: true,
          });
        }
      } else if (setWorkingData) {
        setWorkingData({
          ...workingData,
          model: undefined,
          modelHistory: undefined,
          modelValidityDataFeatureHash: undefined,
        });
      }
    }
  }, []);

  const trainingData = useMemo(() => {
    if (!workingData || workingData.data === undefined) return undefined;

    if (
      !retrievedPreviousData &&
      workingData &&
      workingData.trainingData &&
      workingData.testingData
    ) {
      setRetrievedPreviousData(true);
      setTestingData(workingData.testingData);
      return workingData.trainingData;
    }

    let features = workingData.data.record_instances.map(
      (instance: any) => instance.featureVector
    );
    let labels = workingData.data.record_instances.map(
      (instance) => instance.classification
    );

    // convert labels to indexes
    let labelsPossible = labels
      .filter((value, index, self) => self.indexOf(value) === index)
      .sort();
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

    if (trainingProportion === 1) {
      setTestingData({ features: [], labels: [] });
      return { features, labels };
    }

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

    let modelSchema;
    switch (preset) {
      case ProcessingPresets.movement:
        modelSchema = getMovementModel(
          trainingData.features,
          trainingData.labels,
          numClasses,
          numEpochs
        );
        break;
      default:
        console.error("Unknown preset, defaulting to movement");
        modelSchema = getMovementModel(
          trainingData.features,
          trainingData.labels,
          numClasses,
          numEpochs
        );
    }

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
                trainingData: trainingData,
                numEpochs: numEpochs,
              });
            }
            if (setStepInfo) {
              setStepInfo({
                ...stepInfo,
                allowNext: true,
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
        <HelpTextContainer>
          The data is split into training and test sets. The training set is
          used to train the model, and the test set is used to evaluate the
          model's performance on the next page. Use the slider to adjust the
          proportion of the data that is used for training.
        </HelpTextContainer>

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
        {trainingProportion !== 1 && (
          <Flex mx={20}>
            <Flex wrap={"wrap"} mx={5} flex={1} justifyContent={"center"}>
              {trainingData && trainingData.labels
                ? trainingData.labels.map((label, i) => (
                    <Button
                      as={"div"}
                      key={i}
                      colorScheme={getClassColourScheme(label)}
                      m={1}
                      borderRadius={"full"}
                      size={"xs"}
                    />
                  ))
                : null}
            </Flex>
            <Spacer />
            <Flex wrap={"wrap"} mx={5} flex={1} justifyContent={"center"}>
              {testingData && testingData.labels
                ? testingData.labels.map((label, i) => (
                    <Button
                      as={"div"}
                      key={i}
                      colorScheme={getClassColourScheme(label)}
                      m={1}
                      borderRadius={"full"}
                      size={"xs"}
                    />
                  ))
                : null}
            </Flex>
          </Flex>
        )}

        <Heading size="md" my={2}>
          Model Configuration
        </Heading>
        <HelpTextContainer>
          Much like the pre-processing step, the way we configure the model and
          its training process depends on the data and the task at hand.
          Different model 'architectures' can be used. You can try out a number
          of configurations to see which produces the best results. Try one that
          fits your use case first.
        </HelpTextContainer>

        <Container maxW={"container.md"}>
          <FormControl id="modelArchitecture" mt={3}>
            <FormLabel>Model Configuration - Use Case</FormLabel>
            <Select
              onChange={(e) => {
                setPreset(e.target.value as ProcessingPresets);
              }}
              value={preset}
              mt={3}
            >
              {(Object.values(ProcessingPresets) as Array<ProcessingPresets>)
                .filter((preset) => preset !== ProcessingPresets.custom)
                .map((preset) => {
                  return (
                    <option key={preset} value={preset}>
                      {preset}
                    </option>
                  );
                })}
            </Select>
            <FormHelperText>
              This configures the model and training process to produce good
              results.
            </FormHelperText>
          </FormControl>
        </Container>

        <Accordion allowToggle my={5}>
          <AccordionItem>
            <AccordionButton>
              <Box flex="1" textAlign="left">
                Advanced Options
              </Box>
              <AccordionIcon />
            </AccordionButton>
            <AccordionPanel pb={4}>
              <FormControl id="numEpochs">
                <FormLabel>Number of Epochs</FormLabel>
                <NumberInput
                  value={numEpochs}
                  min={3}
                  max={100}
                  step={1}
                  onChange={(value) => {
                    if (value) setNumEpochs(parseInt(value));
                  }}
                >
                  <NumberInputField />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormHelperText>
                  The number of times the model will be trained on the entire
                  training set. More epochs can improve accuracy, but can also
                  lead to overfitting.
                </FormHelperText>
              </FormControl>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>

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
          <Flex>
            <Heading>Training History</Heading>
            <Spacer />
            <Text mr={2}>Show Loss:</Text>
            <Switch
              isChecked={showLoss}
              onChange={(e) => setShowLoss(e.target.checked)}
              colorScheme="orange"
              size="lg"
              mr={2}
            />
          </Flex>
          {modelHistory ? (
            <>
              {showLoss && (
                <Alert status="info" my={3} colorScheme={"orange"}>
                  <AlertIcon />
                  <AlertTitle mr={2}>Loss</AlertTitle>
                  <AlertDescription>
                    A measure of how far the model's predictions are from the
                    actual class. A lower loss is better.
                  </AlertDescription>
                </Alert>
              )}
              <HelpTextContainer>
                This graph shows the accuracy of the model during training based
                only on the training data. We expect that this will rise
                throughout the training - the graph should go up. We can't see
                how this model performs on unseen data until we evaluate it on
                the next page.
              </HelpTextContainer>
              {modelHistory.accuracy[modelHistory.accuracy.length - 1] <
              0.75 ? (
                <Alert status="error" mb={3}>
                  <AlertIcon />
                  <AlertTitle mr={2}>Low Accuracy</AlertTitle>
                  <AlertDescription>
                    Your model isn't very accurate. Try training it again as it
                    may vary between training runs. You can also try changing
                    the model configuration, collecting more data, or changing
                    the pre-processing.
                  </AlertDescription>
                </Alert>
              ) : null}
              <Line
                options={{
                  responsive: true,
                  plugins: {
                    legend: {
                      display: showLoss,
                    },
                  },
                  scales: {
                    yLoss: {
                      type: "linear" as const,
                      display: showLoss,
                      position: "right" as const,
                      title: {
                        display: true,
                        text: "Loss",
                        color: "darkorange",
                      },
                      min: 0,
                    },
                    yAccuracy: {
                      type: "linear" as const,
                      display: true,
                      position: "left" as const,
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
                  datasets: showLoss
                    ? [
                        {
                          label: "Loss",
                          data: modelHistory.loss,
                          borderColor: "darkorange",
                          backgroundColor: "darkorange",
                          yAxisID: "yLoss",
                        },
                        {
                          label: "Accuracy",
                          data: modelHistory.accuracy,
                          borderColor: "green",
                          backgroundColor: "green",
                          yAxisID: "yAccuracy",
                        },
                      ]
                    : [
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
