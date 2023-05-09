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
} from "@chakra-ui/react";
import { useEffect } from "react";
import { PageProps } from "../App";
import { useQuery } from "react-query";
import { getData } from "../data/api";
import { APIData, RecordInstance } from "../data/types";

export const Data = ({ setCurrentPhase }: PageProps) => {
  const getDataQuery: { data: APIData | undefined; [key: string]: any } =
    useQuery("getData", getData);

  useEffect(() => {
    setCurrentPhase("Data Collection");
  }, [setCurrentPhase]);

  useEffect(() => {
    console.log("data", getDataQuery.data);
  }, [getDataQuery.data]);

  return (
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
                    <Td>{record.deviceID}</Td>
                    <Td>{record.uniqueID}</Td>
                    <Td>{record.classification}</Td>
                    <Td>
                      <Button
                        onClick={() => {
                          console.log(record);
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
  );
};
