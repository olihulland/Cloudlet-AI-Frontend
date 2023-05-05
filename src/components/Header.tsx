import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbSeparator,
  Center,
  Container,
  Flex,
  Heading,
  Spacer,
  Text,
} from "@chakra-ui/react";
import { ColorModeSwitcher } from "./ColorModeSwitcher";
import * as React from "react";
import { AiFillCloud } from "react-icons/ai";

export const Header = ({ currentPhase }: { currentPhase?: string }) => {
  return (
    <Box as="nav" boxShadow="sm" mb={10}>
      <Container maxWidth="container.xl">
        <Flex flexDir={"row"} py={3}>
          <Center mr={5}>
            <AiFillCloud fontSize={35} />
            <Heading size="md" m={0} p={0}>
              &nbsp;&nbsp;Cloudlet&nbsp;
            </Heading>
          </Center>
          <Center>
            <Breadcrumb rounded="lg" bg="chakra-subtle-bg" px={2} py={1}>
              <BreadcrumbItem isCurrentPage={currentPhase == undefined}>
                <Text>Machine Learning</Text>
              </BreadcrumbItem>
              {currentPhase ? (
                <BreadcrumbItem isCurrentPage>
                  <Text>{currentPhase}</Text>
                </BreadcrumbItem>
              ) : null}
            </Breadcrumb>
          </Center>
          <Spacer />
          <Center>
            <ColorModeSwitcher />
          </Center>
        </Flex>
      </Container>
    </Box>
  );
};
