import { Container, Heading, Text } from "@chakra-ui/react";
import * as React from "react";

export const Intro = () => {
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
        <Text>Here I could put an interactive diagram showing the process?</Text>
      </Container>
    </Container>
  );
};
