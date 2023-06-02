import * as React from "react";
import {
  Alert,
  AlertTitle,
  AlertIcon,
  Container,
  Heading,
  Spinner,
  VStack,
  Table,
  TableContainer,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  HStack,
  Button,
  useDisclosure,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  Card,
  CardBody,
  StatHelpText,
  Box,
  Input,
  IconButton,
  Spacer,
  Popover,
  PopoverTrigger,
  PopoverHeader,
  PopoverContent,
  PopoverCloseButton,
  PopoverBody,
  PopoverArrow,
  CardHeader,
  Badge,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { PageProps } from "../App";
import { useMutation, useQuery } from "react-query";
import { getData, ident, setClassName } from "../data/api";
import { APIData, RecordInstance } from "../data/types";
import { ViewRecordInstanceModal } from "../components/ViewRecordInstanceModal";
import { getClassName, getFriendlyMicrobitID } from "../data/utils";
import { CheckIcon, EditIcon } from "@chakra-ui/icons";
import { RawDataSVGLine } from "../components/RawDataSVGLine";

export const Data = ({
  setStepInfo,
  setWorkingData,
  workingData,
}: PageProps) => {
  const getDataQuery: { data: APIData | undefined; [key: string]: any } =
    useQuery("getData", getData);

  const classNameMutation = useMutation({
    mutationFn: setClassName,
  });

  const viewRecordDisclosure = useDisclosure();
  const [openRecordInstance, setOpenRecordInstance] =
    useState<RecordInstance>();

  useEffect(() => {
    setStepInfo({
      currentPhase: "Data Collection",
      nextStep: "/pre-processing",
    });
  }, [setStepInfo]);

  // set working data based on selected data
  useEffect(() => {
    if (getDataQuery.data) {
      setWorkingData?.({
        ...workingData,
        data: getDataQuery.data,
      });
    } else {
      setWorkingData?.({
        ...workingData,
        data: undefined,
      });
    }
  }, [getDataQuery.data, setWorkingData]);

  const classesList = useMemo(() => {
    return getDataQuery.data?.record_instances
      .reduce((acc, curr) => {
        return acc.includes(curr.classification)
          ? acc
          : [...acc, curr.classification];
      }, [] as number[])
      .sort();
  }, [getDataQuery.data]);

  const STATS_BANNER = (
    <Flex gap={3} mb={5} justifyContent={"space-evenly"}>
      <Card flexGrow={1}>
        <CardBody>
          <Stat>
            <StatLabel>Number of recordings</StatLabel>
            <StatNumber>
              {getDataQuery.data?.record_instances.length}
            </StatNumber>
          </Stat>
        </CardBody>
      </Card>
      <Card flexGrow={1}>
        <CardBody>
          <Stat>
            <StatLabel>Number of classes</StatLabel>
            <StatNumber>{classesList?.length}</StatNumber>
          </Stat>
        </CardBody>
      </Card>
      <Card flexGrow={1}>
        <CardBody>
          <Stat>
            <StatLabel>Number of known microbits</StatLabel>
            <StatNumber>{getDataQuery.data?.microbits.length}</StatNumber>
            <StatHelpText>(known to the cloud)</StatHelpText>
          </Stat>
        </CardBody>
      </Card>
      <Card flexGrow={1}>
        <CardBody>
          <Stat>
            <StatLabel>Number of contributing microbits</StatLabel>
            <StatNumber>
              {
                getDataQuery.data?.record_instances.reduce((acc, curr) => {
                  return acc.includes(curr.deviceID)
                    ? acc
                    : [...acc, curr.deviceID];
                }, [] as any[]).length
              }
            </StatNumber>
            <StatHelpText>(contributed recordings)</StatHelpText>
          </Stat>
        </CardBody>
      </Card>
      <Card flexGrow={1}>
        <CardBody>
          <VStack>
            <Button onClick={ident}>Identify Micro:bits</Button>
          </VStack>
        </CardBody>
      </Card>
    </Flex>
  );

  const CLASS_SECTION = (
    <Box mb={3}>
      <Heading>Classes</Heading>
      <TableContainer>
        <Table>
          <Thead>
            <Tr>
              <Th>Class Number</Th>
              <Th>Class Name</Th>
              <Th>Number of Recordings</Th>
            </Tr>
          </Thead>
          <Tbody>
            {classesList?.map((classID: number) => {
              if (classID == null) return null;
              return (
                <Tr key={classID}>
                  <Td>{classID}</Td>
                  <Td>
                    <HStack>
                      <Badge colorScheme={"purple"}>
                        {
                          getDataQuery.data?.classes.find(
                            (classObj) =>
                              classObj.id.toString() === classID.toString()
                          )?.name
                        }
                      </Badge>
                      <Spacer />
                      <Popover>
                        <PopoverTrigger>
                          <IconButton
                            aria-label={"Edit Class Name"}
                            icon={<EditIcon />}
                          />
                        </PopoverTrigger>
                        <PopoverContent>
                          <PopoverArrow />
                          <PopoverCloseButton />
                          <PopoverHeader>New Class Name</PopoverHeader>
                          <PopoverBody>
                            <VStack>
                              <Input
                                placeholder={"Class Name"}
                                id={"cn:" + classID.toString()}
                              />
                              <Button
                                onClick={() => {
                                  const newClassName = (
                                    document.getElementById(
                                      "cn:" + classID.toString()
                                    ) as HTMLInputElement
                                  ).value;
                                  classNameMutation.mutate({
                                    id: classID,
                                    name: newClassName,
                                  });
                                }}
                                rightIcon={<CheckIcon />}
                              >
                                Submit
                              </Button>
                            </VStack>
                          </PopoverBody>
                        </PopoverContent>
                      </Popover>
                    </HStack>
                  </Td>
                  <Td>
                    {
                      getDataQuery.data?.record_instances.filter(
                        (record) => record.classification === classID
                      ).length
                    }
                  </Td>
                </Tr>
              );
            })}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );

  const RAW_DATA_SECTION = (
    <>
      <Heading>Raw Data</Heading>
      {getDataQuery.isLoading && (
        <VStack>
          <Spinner size={"xl"} />
          <Heading size={"md"}>Loading Data ...</Heading>
        </VStack>
      )}
      {getDataQuery.isError && (
        <Container>
          <Alert status="error">
            <AlertIcon />
            <AlertTitle>Error Loading Data</AlertTitle>
          </Alert>
        </Container>
      )}
      {getDataQuery.isSuccess && (
        <TableContainer>
          <Table>
            <Thead>
              <Tr>
                <Th>MicroBit ID</Th>
                <Th></Th>
                <Th>Class</Th>
                <Th></Th>
              </Tr>
            </Thead>
            <Tbody>
              {getDataQuery.data?.record_instances
                .sort((a, b) => {
                  return a.classification - b.classification;
                })
                .map((record: RecordInstance) => (
                  <Tr key={record.uniqueID}>
                    <Td>
                      {getDataQuery.data !== undefined &&
                      getFriendlyMicrobitID(
                        record.deviceID,
                        getDataQuery.data
                      ) != undefined
                        ? getFriendlyMicrobitID(
                            record.deviceID,
                            getDataQuery.data
                          )
                        : record.deviceID}
                    </Td>
                    <Td>
                      <RawDataSVGLine data={record.data} />
                    </Td>
                    <Td>
                      <Badge colorScheme={"purple"}>
                        {record.classification != null
                          ? getDataQuery.data !== undefined &&
                            getClassName(
                              record.classification,
                              getDataQuery.data
                            )
                          : "Not Set"}
                      </Badge>
                    </Td>
                    <Td>
                      <Button
                        onClick={() => {
                          setOpenRecordInstance(record);
                          viewRecordDisclosure.onOpen();
                        }}
                      >
                        View
                      </Button>
                    </Td>
                  </Tr>
                ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}
    </>
  );

  return (
    <>
      <Container maxWidth="container.xl" px={10}>
        {STATS_BANNER}
        {CLASS_SECTION}
        {RAW_DATA_SECTION}
      </Container>
      <ViewRecordInstanceModal
        viewRecordDisclosure={viewRecordDisclosure}
        openRecordInstance={openRecordInstance}
      />
    </>
  );
};
