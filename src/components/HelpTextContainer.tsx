import { Container } from "@chakra-ui/react";
import { ReactNode } from "react";

export const HelpTextContainer = ({ children }: { children: ReactNode }) => {
  return (
    <Container
      maxWidth="container.xl"
      bgColor="chakra-subtle-bg"
      rounded="lg"
      py={3}
      px={5}
      my={5}
    >
      {children}
    </Container>
  );
};
