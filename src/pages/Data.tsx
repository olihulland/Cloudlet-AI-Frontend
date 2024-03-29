import * as React from "react";
import {
  Alert,
  AlertTitle,
  AlertDescription,
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
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
import { useEffect, useMemo, useState } from "react";
import { PageProps } from "../App";
import { useMutation, useQuery, useQueryClient } from "react-query";
import { getData, ident, setClassName } from "../data/api";
import { APIData, RecordInstance } from "../data/types";
import { ViewRecordInstanceModal } from "../components/ViewRecordInstanceModal";
import {
  getClassName,
  getClassNameUnsafe,
  getFriendlyMicrobitID,
} from "../data/utils";
import { CheckIcon, EditIcon } from "@chakra-ui/icons";
import { RawDataSVGLine } from "../components/RawDataSVGLine";
import { getClassColourScheme } from "../utils/colour";
import { FiRadio } from "react-icons/fi";
import { HelpTextContainer } from "../components/HelpTextContainer";
import { io } from "socket.io-client";

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

  const queryClient = useQueryClient();

  const [socketInstance, setSocketInstance] = useState<any>();
  useEffect(() => {
    const socket = io(`${process.env.REACT_APP_API_WS}`, {
      transports: ["websocket"],
    });

    setSocketInstance(socket);

    socket.on("connect", () => {
      console.log("ws: connect websocket");
    });

    socket.on("disconnect", (data) => {
      console.log("ws: disconnect ws", data);
    });

    socket.on("data_update", (dataStr) => {
      const data = JSON.parse(dataStr);
      console.log("ws: data update");
      if (data.queries_updated) {
        queryClient.invalidateQueries({ queryKey: data.queries_updated });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const viewRecordDisclosure = useDisclosure();
  const [openRecordInstance, setOpenRecordInstance] =
    useState<RecordInstance>();

  const defStepInfo = {
    currentPhase: "Data Collection",
    nextStep: "/pre-processing",
    allowNext: false,
  };

  useEffect(() => {
    setStepInfo(defStepInfo);
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

  const atLeastTwoOfEachClass = useMemo(() => {
    if (!workingData?.data?.record_instances || !classesList) return false;
    for (let c of classesList) {
      if (
        workingData?.data?.record_instances.filter(
          (ri) => ri.classification === c
        ).length < 2
      )
        return false;
    }
    return true;
  }, [workingData?.data, classesList]);

  const namesUndefined = useMemo(() => {
    return classesList?.some((classID) => {
      if (!getDataQuery.data) return true;
      const name = getClassNameUnsafe(classID, getDataQuery.data);
      return name == null || name === "";
    });
  }, [classesList]);

  useEffect(() => {
    setStepInfo({
      ...defStepInfo,
      allowNext: atLeastTwoOfEachClass && !namesUndefined,
    });
  }, [atLeastTwoOfEachClass, namesUndefined]);

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
          </Stat>
        </CardBody>
      </Card>
      <Card flexGrow={1}>
        <CardBody>
          <Stat>
            <StatLabel>Identify Micro:bits</StatLabel>
            <StatNumber>
              <IconButton
                aria-label={"Identify Micro:bits"}
                icon={<FiRadio />}
                onClick={ident}
              />
            </StatNumber>
            <StatHelpText></StatHelpText>
          </Stat>
        </CardBody>
      </Card>
    </Flex>
  );

  const CLASS_SECTION = (
    <Box mb={3}>
      {namesUndefined && (
        <Alert status="warning" mb={3}>
          <AlertIcon />
          <AlertTitle mr={2}>Some classes have not been named</AlertTitle>
          <AlertDescription>
            You must name all classes before you can continue
          </AlertDescription>
        </Alert>
      )}

      {!atLeastTwoOfEachClass && (
        <Alert status="warning" mb={3}>
          <AlertIcon />
          <AlertTitle mr={2}>
            Some classes have less than 2 recordings
          </AlertTitle>
          <AlertDescription>
            The model will not be able to train with less than 2 recordings per
            class
          </AlertDescription>
        </Alert>
      )}

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
                      <Badge colorScheme={getClassColourScheme(classID)}>
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
                      <Badge
                        colorScheme={getClassColourScheme(
                          record.classification
                        )}
                      >
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
        <HelpTextContainer>
          <Text mb={2}>
            In order to 'train' a machine learning model, you need to collect
            data that is related to what you want to identify. This page
            displays the data collected by the micro:bits connected to your
            cloudlet under the <em>Raw Data</em> tab.
          </Text>
          <Text>
            Data will have been provided a class 'label' in the program running
            on the micro:bit. This label is used to identify what it represents.
            You should use the <em>Class Labels</em> tab to set a friendly name
            for each class.
          </Text>
        </HelpTextContainer>
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
        {(getDataQuery.isSuccess || getDataQuery.isIdle) &&
          getDataQuery.data?.record_instances &&
          getDataQuery.data?.record_instances.length > 0 && (
            <Accordion defaultIndex={[0, 1]} allowMultiple>
              <AccordionItem>
                <AccordionButton py={3}>
                  <Heading size={"lg"}>Class Labels</Heading>
                  <Spacer />
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>{CLASS_SECTION}</AccordionPanel>
              </AccordionItem>
              <AccordionItem>
                <AccordionButton py={3}>
                  <Heading size={"lg"}>Raw Data</Heading>
                  <Spacer />
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel>{RAW_DATA_SECTION}</AccordionPanel>
              </AccordionItem>
            </Accordion>
          )}
        {(getDataQuery.isSuccess || getDataQuery.isIdle) &&
          getDataQuery.data?.record_instances &&
          getDataQuery.data?.record_instances.length < 1 && (
            <Alert status="info">
              <AlertIcon />
              <AlertTitle>No data has been collected</AlertTitle>
              <AlertDescription>
                Please ensure that your micro:bits are connected to the cloudlet
                and running the appropriate program.
              </AlertDescription>
            </Alert>
          )}
      </Container>
      <ViewRecordInstanceModal
        viewRecordDisclosure={viewRecordDisclosure}
        openRecordInstance={openRecordInstance}
      />
    </>
  );
};
