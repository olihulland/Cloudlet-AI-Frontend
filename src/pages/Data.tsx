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
  Button,
  useDisclosure,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { PageProps } from "../App";
import { useQuery } from "react-query";
import { getData } from "../data/api";
import { APIData, RecordInstance } from "../data/types";
import { ViewRecordInstanceModal } from "../components/ViewRecordInstanceModal";
import { getFriendlyMicrobitID } from "../data/utils";

export const Data = ({ setStepInfo, setWorkingData }: PageProps) => {
  const getDataQuery: { data: APIData | undefined; [key: string]: any } =
    useQuery("getData", getData);

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
    console.log("data", getDataQuery.data);
    if (getDataQuery.data) {
      setWorkingData?.({
        data: getDataQuery.data,
      });
    } else {
      setWorkingData?.(undefined);
    }
  }, [getDataQuery.data, setWorkingData]);

  return (
    <>
      <Container maxWidth="container.xl" px={10}>
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
                  <Th>Record ID</Th>
                  <Th>Class</Th>
                  <Th></Th>
                </Tr>
              </Thead>
              <Tbody>
                {getDataQuery.data?.record_instances.map(
                  (record: RecordInstance) => (
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
                      <Td>{record.uniqueID}</Td>
                      <Td>
                        {record.classification != null
                          ? record.classification
                          : "Not Set"}
                      </Td>
                      <Td>
                        <Button
                          onClick={() => {
                            console.log(record);
                            setOpenRecordInstance(record);
                            viewRecordDisclosure.onOpen();
                          }}
                        >
                          View
                        </Button>
                      </Td>
                    </Tr>
                  )
                )}
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </Container>
      <ViewRecordInstanceModal
        viewRecordDisclosure={viewRecordDisclosure}
        openRecordInstance={openRecordInstance}
      />
    </>
  );
};
