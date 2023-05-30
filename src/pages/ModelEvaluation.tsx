import { PageProps } from "../App";
import {
  Alert,
  AlertIcon,
  Badge,
  Button,
  Container,
  Flex,
  Heading,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import * as tf from "@tensorflow/tfjs";
import { Tensor } from "@tensorflow/tfjs";

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

  const sendModel = async () => {
    if (!workingData?.model) {
      console.error("Model undefined - unable to send");
      return;
    }
    console.log("sending model");

    await workingData.model.save(`${process.env.REACT_APP_API_URL}/model`);

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
        <Heading mb={3}>Model Evaluation</Heading>

        {workingData?.testingData?.labels &&
        workingData?.testingData?.labels.length > 0 ? (
          <>
            <Flex flexDir={"row"} mb={3}>
              <Heading size={"md"} mr={4}>
                Accuracy: {Math.round(accuracy * 100)}%
              </Heading>
            </Flex>

            <TableContainer>
              <Table size={"lg"}>
                <Thead>
                  <Tr>
                    <Th>Actual</Th>
                    <Th>Predicted</Th>
                    <Th>Feature Vector</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {workingData?.testingData?.features.map((feature, index) => (
                    <Tr key={index}>
                      <Td>
                        <Badge colorScheme={"purple"}>
                          {indexToName(workingData?.testingData?.labels[index])}
                        </Badge>
                      </Td>
                      <Td>
                        <Badge colorScheme={"purple"}>
                          {indexToName(predictions[index])}
                        </Badge>
                      </Td>
                      <Td>
                        {feature.map((f: number) => Math.round(f)).join(",")}
                      </Td>
                    </Tr>
                  ))}
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
        <Button
          colorScheme="blue"
          size="lg"
          onClick={sendModel}
          disabled={!workingData?.model}
          mr={2}
        >
          Send Model
        </Button>
        <Button colorScheme="orange" size="lg" onClick={getModelFile}>
          Get Model
        </Button>
      </Container>
    </>
  );
};
