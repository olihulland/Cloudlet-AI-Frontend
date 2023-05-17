import { PageProps } from "../App";
import { useEffect, useMemo, useState } from "react";
import { Container, Heading, Button, Flex } from "@chakra-ui/react";
import * as React from "react";
import * as tf from "@tensorflow/tfjs";

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
  const [model, setModel] = useState<tf.Sequential | undefined>(undefined);

  const trainingDataTensors = useMemo(() => {
    if (!workingData || workingData.data === undefined) return undefined;

    let features = workingData.data.record_instances.map(
      (instance: any) => instance.featureVector
    );
    console.log("features", features);
    let labels = workingData.data.record_instances.map(
      (instance) => instance.classification
    );
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

    const featureTensor = tf.tensor(features);
    const labelTensor = tf.tensor(labels);

    return {
      features: featureTensor,
      labels: labelTensor,
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

  const trainModel = async () => {
    if (!trainingDataTensors || !numClasses) {
      console.error("Training data tensors undefined - unable to train");
      return;
    }

    setTraining(true);

    const model = tf.sequential({
      layers: [
        tf.layers.dense({
          units: 20,
          activation: "relu",
          inputShape: [13],
        }),
        tf.layers.dense({
          units: 10,
          activation: "relu",
        }),
        tf.layers.dense({
          units: numClasses,
          activation: "softmax",
        }),
      ],
    });

    model.compile({
      optimizer: tf.train.adam(0.005, 0.9, 0.999),
      loss: "sparseCategoricalCrossentropy",
      metrics: ["accuracy"],
    });

    trainingDataTensors.features.array().then((array) => {
      console.log("f d", array);
    });
    console.log("f s: ", trainingDataTensors.features.shape);
    console.log("f type: ", trainingDataTensors.features.dtype);

    trainingDataTensors.labels.array().then((array) => {
      console.log("l d", array);
    });
    console.log("l s: ", trainingDataTensors.labels.shape);
    console.log("l type: ", trainingDataTensors.labels.dtype);

    console.log("num classes: ", numClasses);

    await model
      .fit(trainingDataTensors.features, trainingDataTensors.labels, {
        epochs: 40,
        batchSize: 32,
        callbacks: {
          onEpochEnd: async (epoch, logs) => {
            console.log(
              "Epoch: " + epoch,
              "Loss: " + logs?.loss,
              "Accuracy: " + logs?.acc
            );
          },
        },
      })
      .then((info) => {
        console.log(info);
        setModel(model);
      });

    // evaluate model
    const evalOutput = model.evaluate(
      trainingDataTensors.features,
      trainingDataTensors.labels
    );
    // @ts-ignore
    evalOutput[0].print();
    // @ts-ignore
    evalOutput[1].print();

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
      </Container>
    </>
  );
};
