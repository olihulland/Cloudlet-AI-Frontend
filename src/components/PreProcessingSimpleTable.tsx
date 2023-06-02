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
import { useEffect, useMemo, useState } from "react";
import * as math from "mathjs";
import { getClassName } from "../data/utils";
import { solveFeature } from "../data/pre-processing/CommonOperations";
import { getClassColourScheme } from "../utils/colour";

interface Props {
  features: Feature[];
  setWorkingData?: (newData: WorkingData) => void;
  workingData?: WorkingData;
}

export const PreProcessingSimpleTable = ({
  features,
  workingData,
  setWorkingData,
}: Props) => {
  const [isProcessed, setisProcessed] = useState<boolean>(false);

  const processedData = useMemo(() => {
    let toReturn: { [key: string]: any[] } = {};
    if (workingData !== undefined && workingData.data !== undefined) {
      for (const record of workingData.data.record_instances) {
        toReturn[record.uniqueID] = [];
        for (const feature of features) {
          const processedFeature: any = { ...feature };
          let res = solveFeature(feature, record);
          processedFeature["result"] = res;
          toReturn[record.uniqueID].push({ ...processedFeature });
        }
      }
    }
    return toReturn;
  }, [features, workingData]);

  useEffect(() => {
    if (
      workingData !== undefined &&
      setWorkingData !== undefined &&
      processedData !== undefined
    ) {
      if (Object.keys(processedData).length > 0) {
        let newWorkingData = workingData;
        if (newWorkingData.data !== undefined) {
          newWorkingData.data.record_instances =
            newWorkingData.data.record_instances
              .map((record: RecordInstance) => {
                let newRecord = record as RecordInstanceProcessed;
                newRecord.featureVector = processedData[record.uniqueID].map(
                  (proc: any) => proc.result
                );
                return newRecord;
              })
              .sort((a, b) => {
                return a.classification - b.classification;
              });
          setWorkingData(newWorkingData);
          setisProcessed(true);
        }
      }
    }
  }, [processedData, workingData, setWorkingData]);

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

  if (isProcessed) {
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
