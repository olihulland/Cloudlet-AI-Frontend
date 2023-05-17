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

export const PreProcessing = ({
  setStepInfo,
  workingData,
  setWorkingData,
}: PageProps) => {
  useEffect(() => {
    setStepInfo({
      currentPhase: "Data Pre-Processing",
      nextStep: "/model-training",
      prevStep: "/data",
      allowNext: false,
    });
  }, [setStepInfo]);

  const [preset, setPreset] = useState<ProcessingPresets>(
    ProcessingPresets.custom
  );
  const [features, setFeatures] = useState<Feature[]>([]);

  useEffect(() => {
    if (preset !== undefined) {
      setStepInfo({
        currentPhase: "Data Pre-Processing",
        nextStep: "/model-training",
        prevStep: "/data",
        allowNext: true,
      });

      console.log("preset change", preset);
      switch (preset) {
        case ProcessingPresets.custom:
          setFeatures([]);
          break;
        case ProcessingPresets.movement:
          setFeatures(movementFeatures);
          break;
      }
    } else {
      setStepInfo({
        currentPhase: "Data Pre-Processing",
        nextStep: "/model-training",
        prevStep: "/data",
        allowNext: false,
      });
    }
  }, [preset]);

  useEffect(() => {
    if (
      setWorkingData !== undefined &&
      features !== undefined &&
      workingData !== undefined
    ) {
      setWorkingData({
        ...workingData,
        features: features,
      });
    }
  }, [features, setWorkingData]);

  return (
    <>
      <Container maxWidth="container.xl" px={10}>
        <Heading>Data Pre-Processing</Heading>
        <FormControl>
          <FormLabel>Select pre-processing preset:</FormLabel>
          <Select
            onChange={(e) => {
              setPreset(e.target.value as ProcessingPresets);
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
        <Accordion defaultIndex={[0]} allowMultiple allowToggle my={5}>
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
              {preset !== undefined && features.length > 0 ? (
                <PreProcessingSimpleTable
                  features={features}
                  setWorkingData={setWorkingData}
                  workingData={workingData}
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
    </>
  );
};
