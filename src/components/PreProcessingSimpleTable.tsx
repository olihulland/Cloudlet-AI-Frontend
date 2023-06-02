import {
  Feature,
  RecordInstance,
  RecordInstanceProcessed,
  WorkingData,
} from "../data/types";
import {
  Alert,
  AlertIcon,
  AlertTitle,
  Badge,
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
import * as math from "mathjs";
import { getClassName } from "../data/utils";
import { getClassColourScheme } from "../utils/colour";

interface Props {
  isProcessed: boolean;
  processedData?: { [key: string]: any[] };
  workingData?: WorkingData;
}

export const PreProcessingSimpleTable = ({
  workingData,
  isProcessed,
  processedData,
}: Props) => {
  if (workingData === undefined) {
    return (
      <Alert status={"warning"}>
        <AlertIcon />
        <AlertTitle>
          No data selected. Please go back to the data collection step and
          select data.
        </AlertTitle>
      </Alert>
    );
  }

  if (isProcessed && processedData) {
    return (
      <TableContainer>
        <Table>
          <Thead>
            <Tr>
              <Th>Class</Th>
              <Th>|</Th>
              {Object.values(processedData)[0].map((feature) => {
                return <Th textTransform={"unset"}>{feature.name}</Th>;
              })}
            </Tr>
          </Thead>
          <Tbody>
            {workingData?.data?.record_instances.map(
              // @ts-ignore
              (record: RecordInstanceProcessed) => (
                <Tr key={record.uniqueID}>
                  <Td>
                    <Badge
                      colorScheme={getClassColourScheme(record.classification)}
                    >
                      {record.classification != null
                        ? workingData.data !== undefined &&
                          getClassName(record.classification, workingData.data)
                        : "Not Set"}
                    </Badge>
                  </Td>
                  <Td></Td>
                  {processedData[record.uniqueID].map((feature) => {
                    return <Td>{math.round(feature.result, 1)}</Td>;
                  })}
                </Tr>
              )
            )}
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
