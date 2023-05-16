import {
  RecordInstance,
  RecordInstanceProcessed,
  WorkingData,
} from "../data/types";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Button,
  Center,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import * as React from "react";
import { useEffect, useState } from "react";
import { round } from "mathjs";

interface Props {
  featureVectorGenerator: (data: RecordInstance) => RecordInstanceProcessed;
  setWorkingData?: (newData: WorkingData) => void;
  workingData?: WorkingData;
}

export const PreProcessingSimpleTable = ({
  featureVectorGenerator,
  workingData,
  setWorkingData,
}: Props) => {
  const [dataProcessed, setDataProcessed] = useState<boolean>(false);

  useEffect(() => {
    if (workingData !== undefined && setWorkingData !== undefined) {
      console.log("begin processing");

      let newWorkingData = workingData;
      newWorkingData.data.record_instances =
        newWorkingData.data.record_instances.map((record: RecordInstance) => {
          try {
            return featureVectorGenerator(record);
          } catch (e) {
            console.error("Error processing record: ", record, "Error: ", e);
            return record;
          }
        });
      setWorkingData(newWorkingData);
      setDataProcessed(true);
      console.log("processed: ", newWorkingData);
    }
  }, [featureVectorGenerator, setWorkingData, workingData]);

  if (workingData === undefined) {
    return (
      <Alert>
        <AlertIcon />
        <AlertTitle>
          No data selected. Please go back to the data collection step and
          select data.
        </AlertTitle>
      </Alert>
    );
  }

  if (dataProcessed) {
    return (
      <TableContainer>
        <Table>
          <Thead>
            <Tr>
              <Th>MicroBit ID</Th>
              <Th>Record ID</Th>
              <Th>Class</Th>
              <Th>Feature Vector</Th>
            </Tr>
          </Thead>
          <Tbody>
            {workingData?.data.record_instances.map(
              // @ts-ignore
              (record: RecordInstanceProcessed) => (
                <Tr key={record.uniqueID}>
                  <Td>{record.deviceID}</Td>
                  <Td>{record.uniqueID}</Td>
                  <Td>
                    {record.classification != null
                      ? record.classification
                      : "Not Set"}
                  </Td>
                  <Td>
                    {record.featureVector
                      .map((num) => {
                        if (!num) return num;
                        return round(num, 1);
                      })
                      .toString()}
                  </Td>
                </Tr>
              )
            )}

            {/*{getDataQuery.data?.record_instances.map((record: RecordInstance) => (*/}
            {/*  <Tr key={record.uniqueID}>*/}
            {/*    <Td>{record.deviceID}</Td>*/}
            {/*    <Td>{record.uniqueID}</Td>*/}
            {/*    <Td>*/}
            {/*      {record.classification != null*/}
            {/*        ? record.classification*/}
            {/*        : "Not Set"}*/}
            {/*    </Td>*/}
            {/*    <Td>*/}
            {/*      <Button*/}
            {/*        onClick={() => {*/}
            {/*          console.log(record);*/}
            {/*          setOpenRecordInstance(record);*/}
            {/*          viewRecordDisclosure.onOpen();*/}
            {/*        }}*/}
            {/*      >*/}
            {/*        View*/}
            {/*      </Button>*/}
            {/*    </Td>*/}
            {/*  </Tr>*/}
            {/*))}*/}
          </Tbody>
        </Table>
      </TableContainer>
    );
  } else {
    return (
      <Center>
        <Spinner size={"xl"} />
      </Center>
    );
  }
};
