import { PageProps } from "../App";
import { useEffect } from "react";
import {
  Container,
  Flex,
  Heading,
  Select,
  Text,
  FormControl,
  FormHelperText,
  FormLabel,
} from "@chakra-ui/react";
import * as React from "react";

import { PreProcessingSimpleTable } from "../components/PreProcessingSimpleTable";
import { movementFeatures } from "../data/pre-processing/movement";

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

  const [preset, setPreset] = React.useState<string | undefined>();

  useEffect(() => {
    if (preset !== undefined && preset !== "") {
      setStepInfo({
        currentPhase: "Data Pre-Processing",
        nextStep: "/model-training",
        prevStep: "/data",
        allowNext: true,
      });
    } else {
      setStepInfo({
        currentPhase: "Data Pre-Processing",
        nextStep: "/model-training",
        prevStep: "/data",
        allowNext: false,
      });
    }
  }, [preset]);

  return (
    <>
      <Container maxWidth="container.xl" px={10}>
        <Heading>Data Pre-Processing</Heading>
        <FormControl>
          <FormLabel>Select pre-processing preset:</FormLabel>
          <Select
            placeholder={"Select preset"}
            onChange={(e) => {
              setPreset(e.target.value);
            }}
          >
            <option value={"movement"}>Movement Data</option>
          </Select>
          <FormHelperText>
            This should be selected to best suit your application.
          </FormHelperText>
        </FormControl>
        {preset && preset === "movement" && (
          <PreProcessingSimpleTable
            features={movementFeatures}
            setWorkingData={setWorkingData}
            workingData={workingData}
          />
        )}
      </Container>
    </>
  );
};
