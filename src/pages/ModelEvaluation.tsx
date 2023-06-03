import { PageProps } from "../App";
import {
  Alert,
  AlertIcon,
  Badge,
  Button,
  Container,
  Flex,
  Heading,
  IconButton,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text,
  StatGroup,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Box,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as tf from "@tensorflow/tfjs";
import { Tensor } from "@tensorflow/tfjs";
import { generateExtension } from "../extension_generation/main";
import { RecordInstanceProcessed } from "../data/types";
import { getClassColourScheme } from "../utils/colour";
import { RawDataSVGLine } from "../components/RawDataSVGLine";
import { ChevronRightIcon } from "@chakra-ui/icons";
import { HelpTextContainer } from "../components/HelpTextContainer";

export const ModelEvaluation = ({ setStepInfo, workingData }: PageProps) => {
  useEffect(() => {
    setStepInfo({
      currentPhase: "Model Evaluation",
      nextStep: undefined,
      prevStep: "/model-training",
      allowNext: false,
    });
  }, [setStepInfo]);

  const navigate = useNavigate();

  useEffect(() => {
    if (
      !workingData?.model ||
      !workingData?.testingData ||
      !workingData?.data?.classes
    ) {
      navigate("/model-training");
    }
  }, []);

  const indexToName = (index: number | undefined) => {
    if (!workingData?.data?.classes || index === undefined) {
      return "";
    }
    const labels = [...workingData.data.classes].sort((a, b) => a.id - b.id);
    return labels[index].name;
  };

  const predictions = useMemo(() => {
    if (
      !workingData?.model ||
      !workingData?.testingData ||
      !workingData?.data?.classes ||
      workingData.testingData.labels.length < 1
    ) {
      return [];
    }

    const model = workingData.model;
    const testingData = workingData.testingData;

    const predArrs = (
      model.predict(tf.tensor(testingData.features)) as Tensor
    ).arraySync();

    return (predArrs as number[][]).map((predArr) => {
      const max = Math.max(...predArr);
      return predArr.indexOf(max);
    });
  }, [workingData?.model, workingData?.testingData]);

  const accuracy = useMemo(() => {
    if (!workingData?.testingData || !predictions) {
      return 0;
    }
    let correct = 0;
    predictions.forEach((pred, index) => {
      if (pred === workingData.testingData?.labels[index]) {
        correct++;
      }
    });
    return correct / predictions.length;
  }, [predictions]);

  const seenAccuracy = useMemo(() => {
    if (!workingData?.trainingData || !workingData?.model) {
      return 0;
    }

    const model = workingData.model;
    const trainingData = workingData.trainingData;

    const predArrs = (
      model.predict(tf.tensor(trainingData.features)) as Tensor
    ).arraySync();

    const p = (predArrs as number[][]).map((predArr) => {
      const max = Math.max(...predArr);
      return predArr.indexOf(max);
    });

    let correct = 0;
    p.forEach((pred, index) => {
      if (pred === trainingData.labels[index]) {
        correct++;
      }
    });
    return correct / p.length;
  }, [workingData, workingData?.trainingData]);

  const [extensionUrls, setExtensionUrls] = useState<{
    ts: string;
    modelCpp: string;
    modelH: string;
  }>();
  const beginExtensionGeneration = async () => {
    setExtensionUrls(undefined);
    if (!workingData || !workingData.model) {
      console.error("Model undefined - unable to generate extension");
      return;
    }
    const ext = await generateExtension(workingData);

    const tsBlob = new Blob([ext.ts], { type: "text/plain" });
    const modelCppBlob = new Blob([ext.modelCpp], { type: "text/plain" });
    const modelHBlob = new Blob([ext.modelH], { type: "text/plain" });

    const tsUrl = window.URL.createObjectURL(tsBlob);
    const modelCppUrl = window.URL.createObjectURL(modelCppBlob);
    const modelHUrl = window.URL.createObjectURL(modelHBlob);

    setExtensionUrls({
      ts: tsUrl,
      modelCpp: modelCppUrl,
      modelH: modelHUrl,
    });
  };

  return (
    <>
      <Container maxWidth="container.xl" px={10}>
        <Heading mb={3}>Model Evaluation</Heading>

        <HelpTextContainer>
          In order to assess a models performance, we need to test it on data
          that it has not seen before. Below shows the predictions made by the
          model on the testing data and the accuracy statistics.
        </HelpTextContainer>

        <Box
          p={3}
          borderWidth={1}
          borderColor={"chakra-subtle-text._dark"}
          rounded={"md"}
          mb={3}
        >
          <Heading size="md" mb={3}>
            Statistics
          </Heading>
          <StatGroup my={3}>
            <Stat>
              <StatLabel>Unseen Data Accuracy</StatLabel>
              <StatNumber>{Math.round(accuracy * 100)}%</StatNumber>
              <StatHelpText>
                The accuracy of the model for the testing data. (
                {workingData?.testingData?.labels.length} samples)
              </StatHelpText>
            </Stat>
            <Stat>
              <StatLabel>Seen Data Accuracy</StatLabel>
              <StatNumber>{Math.round(seenAccuracy * 100)}%</StatNumber>
              <StatHelpText>
                The accuracy of the model for the training data. (
                {workingData?.trainingData?.labels.length} samples)
              </StatHelpText>
            </Stat>
          </StatGroup>
          <Alert status={"warning"} mb={3}>
            <AlertIcon />
            It can be difficult to assess the performance of a model with few
            data samples. Try adding more data to improve performance and
            assessment of accuracy, and/or consider increasing the proportion of
            data used for testing.
          </Alert>
        </Box>

        {workingData?.testingData?.labels &&
        workingData?.testingData?.labels.length > 0 ? (
          <>
            <TableContainer>
              <Table size={"lg"}>
                <Thead>
                  <Tr>
                    <Th>Actual</Th>
                    <Th>Predicted</Th>
                    <Th>Raw Data</Th>
                    <Th>Features</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {workingData?.testingData?.features.map((feature, index) => {
                    const raw = (
                      workingData?.data
                        ?.record_instances as RecordInstanceProcessed[]
                    ).find(
                      (instance) =>
                        JSON.stringify(instance.featureVector) ===
                        JSON.stringify(feature)
                    )?.data;

                    return (
                      <Tr key={index}>
                        <Td>
                          <Badge
                            colorScheme={getClassColourScheme(
                              workingData?.testingData?.labels[index]
                            )}
                          >
                            {indexToName(
                              workingData?.testingData?.labels[index]
                            )}
                          </Badge>
                        </Td>
                        <Td>
                          <Badge
                            colorScheme={getClassColourScheme(
                              predictions[index]
                            )}
                          >
                            {indexToName(predictions[index])}
                          </Badge>
                        </Td>
                        <Td>
                          <RawDataSVGLine data={raw ?? []} />
                        </Td>
                        <Td>
                          <IconButton
                            aria-label={"View feature vector"}
                            icon={<ChevronRightIcon />}
                            onClick={() => {
                              alert(feature.join(", "));
                            }}
                          />
                        </Td>
                      </Tr>
                    );
                  })}
                </Tbody>
              </Table>
            </TableContainer>
          </>
        ) : (
          <Alert variant="subtle" status={"info"}>
            <AlertIcon />
            No testing data available. Please go back to the previous step to
            change the training/testing split.
          </Alert>
        )}

        <Heading mt={6} mb={3}>
          Model Deployment
        </Heading>

        <HelpTextContainer>
          To make use of your model in a Micro:bit program, a MakeCode extension
          can be generated and imported into the MakeCode editor by following
          the steps below.
        </HelpTextContainer>

        <Alert status={"warning"} mb={3}>
          <AlertIcon />
          This process has not be finalised. The model can be exported in the
          correct format and the typescript code for the extension can be
          generated. The remainder of the process must be completed locally to
          enable the build (due to limitations in the current MakeCode editor
          build process online).
        </Alert>

        <Flex my={2} gap={2}>
          <Button
            size={"lg"}
            colorScheme={"blue"}
            onClick={beginExtensionGeneration}
          >
            Generate MakeCode Extension
          </Button>
        </Flex>
        {extensionUrls && (
          <>
            <Heading size={"md"} my={3}>
              Download Extension
            </Heading>
            <Flex my={2} gap={2}>
              <Button
                colorScheme={"gray"}
                onClick={() => {
                  window.open(extensionUrls.ts, "_blank");
                }}
              >
                Typescript Extension
              </Button>
              <Button
                colorScheme={"gray"}
                onClick={() => {
                  window.open(extensionUrls.modelCpp, "_blank");
                }}
              >
                Model C++ Code
              </Button>
              <Button
                colorScheme={"gray"}
                onClick={() => {
                  window.open(extensionUrls.modelH, "_blank");
                }}
              >
                Model Header File
              </Button>
            </Flex>
          </>
        )}
      </Container>
    </>
  );
};
