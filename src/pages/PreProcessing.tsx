import { PageProps } from "../App";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import {
  Accordion,
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Alert,
  AlertIcon,
  Container,
  FormControl,
  FormHelperText,
  FormLabel,
  Heading,
  Select,
  Spacer,
} from "@chakra-ui/react";

import { PreProcessingSimpleTable } from "../components/PreProcessingSimpleTable";
import { movementFeatures } from "../data/pre-processing/movement";
import { Feature } from "../data/types";
import { ProcessingPresets } from "../data/pre-processing/presets";
import { PreProcessingFeatureList } from "../components/PreProcessingFeatureList";
import { PreProcessingGraph } from "../components/PreProcessingGraph";
import { useNavigate } from "react-router-dom";
import { PreProcessor } from "../components/PreProcessor";

export const PreProcessing = ({
  setStepInfo,
  workingData,
  setWorkingData,
}: PageProps) => {
  const [preset, setPreset] = useState<ProcessingPresets>();
  const [features, setFeatures] = useState<Feature[]>(
    workingData?.features || []
  );

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
        <Heading>Data Pre-Processing</Heading>
        <FormControl>
          <FormLabel>Select pre-processing preset:</FormLabel>
          <Select
            onChange={(e) => {
              changePreset(e.target.value as ProcessingPresets);
            }}
            value={preset}
          >
            {(Object.values(ProcessingPresets) as Array<ProcessingPresets>).map(
              (preset) => {
                return (
                  <option key={preset} value={preset}>
                    {preset}
                  </option>
                );
              }
            )}
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
