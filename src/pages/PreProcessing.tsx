import { PageProps } from "../App";
import { useEffect } from "react";
import { Container, Heading } from "@chakra-ui/react";
import * as React from "react";

export const PreProcessing = ({ setStepInfo }: PageProps) => {
  useEffect(() => {
    setStepInfo({
      currentPhase: "Data Pre-Processing",
      nextStep: "/model-training",
      prevStep: "/data",
    });
  }, [setStepInfo]);

  return (
    <>
      <Container maxWidth="container.xl" px={10}>
        <Heading>Data Pre-Processing</Heading>
      </Container>
    </>
  );
};
