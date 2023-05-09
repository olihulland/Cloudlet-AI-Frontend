import { Button, Center, Container, Heading, Text } from "@chakra-ui/react";
import { ChevronRightIcon } from "@chakra-ui/icons";
import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { PageProps } from "../App";

export const Intro = ({ setCurrentPhase }: PageProps) => {
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentPhase(undefined);
  }, [setCurrentPhase]);

  return (
    <Container maxWidth="container.xl" px={10}>
      <Heading>Machine Learning with Cloudlet</Heading>
      <Container
        maxWidth="container.xl"
        bgColor="chakra-subtle-bg"
        rounded="lg"
        p={3}
        my={5}
      >
        <Text>
          Here I could put an interactive diagram showing the process?
        </Text>
      </Container>
      <Center>
        <Button
          colorScheme="green"
          size="lg"
          rightIcon={<ChevronRightIcon />}
          onClick={() => {
            navigate("/data");
          }}
        >
          Start
        </Button>
      </Center>
    </Container>
  );
};
