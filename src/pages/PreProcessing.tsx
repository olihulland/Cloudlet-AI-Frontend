import { PageProps } from "../App";
import * as React from "react";
import { useEffect, useState } from "react";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Alert,
  AlertIcon,
  Box,
  Button,
  Center,
  Container,
  Flex,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Select,
  Spacer,
  Switch,
  Text,
} from "@chakra-ui/react";

import { PreProcessingSimpleTable } from "../components/PreProcessingSimpleTable";
import { movementFeatures } from "../data/pre-processing/movement";
import { Feature } from "../data/types";
import { ProcessingPresets } from "../data/pre-processing/presets";
import { PreProcessingFeatureList } from "../components/PreProcessingFeatureList";
import { PreProcessingGraph } from "../components/PreProcessingGraph";
import { useNavigate } from "react-router-dom";
import { PreProcessor } from "../components/PreProcessor";
import { HelpTextContainer } from "../components/HelpTextContainer";
import { FaWrench } from "react-icons/fa";

export const PreProcessing = ({
  setStepInfo,
  workingData,
  setWorkingData,
}: PageProps) => {
  const [preset, setPreset] = useState<ProcessingPresets>();
  const [features, setFeatures] = useState<Feature[]>(
    workingData?.features || []
  );

  // TODO consider putting advanced mode in working data
  const [advancedMode, setAdvancedMode] = useState<boolean>(false);

  // handled by PreProcessor:
  const [isProcessed, setIsProcessed] = useState<boolean>(false);
  const [processedData, setProcessedData] = useState();

  const navigate = useNavigate();

  const stepInfoTemplate = {
    currentPhase: "Data Pre-Processing",
    nextStep: "/model-training",
    prevStep: "/data",
    allowNext: false,
  };

  useEffect(() => {
    if (!workingData?.data) {
      navigate("/data");
    }
  }, []);

  useEffect(() => {
    setStepInfo(stepInfoTemplate);
  }, [setStepInfo]);

  useEffect(() => {
    if (workingData && workingData.features) setFeatures(workingData.features);
    if (workingData && workingData.selectedPreset)
      setPreset(workingData.selectedPreset);
  }, [workingData]);

  useEffect(() => {
    if (features.length > 0)
      setStepInfo({ ...stepInfoTemplate, allowNext: true });
    else setStepInfo({ ...stepInfoTemplate, allowNext: false });

    // if edit to preset then switch to "Create your own"
    if (
      preset &&
      preset !== ProcessingPresets.custom &&
      features !== getPresetFeatures(preset) &&
      workingData &&
      setWorkingData
    ) {
      setPreset(ProcessingPresets.custom);
      setWorkingData({
        ...workingData,
        selectedPreset: ProcessingPresets.custom,
      });
    }
  }, [features]);

  const getPresetFeatures = (preset: ProcessingPresets) => {
    switch (preset) {
      case ProcessingPresets.custom:
        return [];
      case ProcessingPresets.movement:
        return movementFeatures;
    }
  };

  const changePreset = (preset: ProcessingPresets) => {
    if (workingData && setWorkingData) {
      setWorkingData({
        ...workingData,
        features: getPresetFeatures(preset),
        selectedPreset: preset,
      });
    }
  };

  return (
    <>
      <Container maxWidth="container.xl">
        <Flex>
          <Heading>Data Pre-Processing</Heading>
          <Spacer />
          <Center>
            <FormControl display="flex" alignItems="center">
              <FormLabel>Advanced Mode</FormLabel>
              <Switch
                size={"lg"}
                isChecked={advancedMode}
                onChange={() => {
                  setAdvancedMode(!advancedMode);
                }}
              />
            </FormControl>
          </Center>
        </Flex>

        <HelpTextContainer>
          <Text>
            Before we can train a model we need to do some preparation. This
            includes doing some maths on the raw data to generate 'features'
            that should summarise the data in a way that is useful for the
            model. These 'feature vectors' are what we use to 'train' and later
            predict with the model.
          </Text>
        </HelpTextContainer>

        {!advancedMode ? (
          <Box mt={4}>
            <Container maxW={"container.md"}>
              <Heading size={"md"}>What are you using the model for?</Heading>
              <Text mt={3}>
                We have a number of preset configurations depending on your use
                case. This generates a set of features that we think will be
                useful for your application and will also influence the
                configuration of the model.
              </Text>
              <Box>
                <Select
                  onChange={(e) => {
                    changePreset(e.target.value as ProcessingPresets);
                  }}
                  value={preset}
                  placeholder={"Select a preset"}
                  mt={3}
                >
                  {(
                    Object.values(ProcessingPresets) as Array<ProcessingPresets>
                  )
                    .filter((preset) => preset !== ProcessingPresets.custom)
                    .map((preset) => {
                      return (
                        <option key={preset} value={preset}>
                          {preset}
                        </option>
                      );
                    })}
                </Select>
              </Box>
              <Flex
                mt={6}
                borderColor={"gray.300"}
                borderWidth={1}
                rounded={"md"}
                p={3}
              >
                <Text overflowWrap={"normal"}>
                  Alternatively, you can configure your own/edit these features
                  in advanced mode.
                </Text>
                <Spacer />
                <Center>
                  <Button
                    onClick={() => {
                      setAdvancedMode(true);
                    }}
                    colorScheme={"orange"}
                    leftIcon={<FaWrench />}
                  >
                    Advanced Mode
                  </Button>
                </Center>
              </Flex>
            </Container>
          </Box>
        ) : (
          <>
            <FormControl>
              <FormLabel>Select pre-processing preset:</FormLabel>
              <Select
                onChange={(e) => {
                  changePreset(e.target.value as ProcessingPresets);
                }}
                value={preset}
              >
                {(
                  Object.values(ProcessingPresets) as Array<ProcessingPresets>
                ).map((preset) => {
                  return (
                    <option key={preset} value={preset}>
                      {preset}
                    </option>
                  );
                })}
              </Select>
              <FormHelperText>
                This should be selected to best suit your application.
              </FormHelperText>
            </FormControl>
            <Accordion defaultIndex={[0, 1]} allowMultiple my={5}>
              <AccordionItem>
                <AccordionButton>
                  <Heading size={"lg"} my={4}>
                    Features
                  </Heading>
                  <Spacer />
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  <PreProcessingFeatureList
                    features={features}
                    setFeatures={setFeatures}
                    workingData={workingData}
                    setWorkingData={setWorkingData}
                  />
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionButton>
                  <Heading size={"lg"} my={4}>
                    Compare Features
                  </Heading>
                  <Spacer />
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  <PreProcessingGraph
                    features={features}
                    workingData={workingData}
                  />
                </AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionButton>
                  <Heading size={"lg"} my={4}>
                    Processed Data
                  </Heading>
                  <Spacer />
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>
                  {features.length > 0 ? (
                    <PreProcessingSimpleTable
                      isProcessed={isProcessed}
                      workingData={workingData}
                      processedData={processedData}
                    />
                  ) : (
                    <Alert>
                      <AlertIcon />
                      Select a pre-processing preset or add features to be
                      calculated.
                    </Alert>
                  )}
                </AccordionPanel>
              </AccordionItem>
            </Accordion>
          </>
        )}
      </Container>
      {features.length > 0 && workingData && setWorkingData && (
        <PreProcessor
          features={features}
          workingData={workingData}
          setWorkingData={setWorkingData}
          setIsProcessed={setIsProcessed}
          setProcessedData={setProcessedData}
        />
      )}
    </>
  );
};
