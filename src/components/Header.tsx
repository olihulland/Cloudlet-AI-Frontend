import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbSeparator,
  Button,
  Center,
  Container,
  Flex,
  Heading,
  IconButton,
  LinkBox,
  Spacer,
  Text,
} from "@chakra-ui/react";
import { ColorModeSwitcher } from "./ColorModeSwitcher";
import * as React from "react";
import { AiFillCloud } from "react-icons/ai";
import { useNavigate } from "react-router-dom";
import { ChevronLeftIcon, ChevronRightIcon } from "@chakra-ui/icons";
import { StepInfo } from "../App";

export const Header = ({ stepInfo }: { stepInfo: StepInfo | undefined }) => {
  const navigate = useNavigate();

  // @ts-ignore
  return (
    <Box as="nav" boxShadow="sm" mb={10}>
      <Container maxWidth="container.xl">
        <Flex flexDir={"row"} py={3}>
          <LinkBox
            onClick={() => {
              navigate("/");
            }}
            _hover={{ cursor: "pointer" }}
          >
            <Center mr={5}>
              <AiFillCloud fontSize={35} />
              <Heading size="md" m={0} p={0}>
                &nbsp;&nbsp;Cloudlet&nbsp;
              </Heading>
            </Center>
          </LinkBox>
          <Center>
            <Breadcrumb rounded="lg" bg="chakra-subtle-bg" px={2} py={1}>
              <BreadcrumbItem
                isCurrentPage={stepInfo?.currentPhase == undefined}
              >
                <Text>Machine Learning</Text>
              </BreadcrumbItem>
              {stepInfo?.currentPhase ? (
                <BreadcrumbItem isCurrentPage>
                  <Text>{stepInfo?.currentPhase}</Text>
                </BreadcrumbItem>
              ) : null}
            </Breadcrumb>
          </Center>
          <Spacer />
          {/*<Center mr={10}>*/}
          {/*  <ColorModeSwitcher />*/}
          {/*</Center>*/}
          {stepInfo?.prevStep && (
            <IconButton
              colorScheme={"blue"}
              icon={<ChevronLeftIcon />}
              aria-label="Previous Step"
              mr={1}
              isDisabled={stepInfo?.prevStep == undefined}
              onClick={() => {
                if (stepInfo && stepInfo.prevStep) navigate(stepInfo?.prevStep);
              }}
            />
          )}
          {stepInfo?.nextStep && (
            <IconButton
              colorScheme={"blue"}
              icon={<ChevronRightIcon />}
              aria-label="Next Step"
              onClick={() => {
                if (stepInfo && stepInfo.nextStep) navigate(stepInfo?.nextStep);
              }}
              isDisabled={stepInfo?.allowNext === false}
            />
          )}
        </Flex>
      </Container>
    </Box>
  );
};
