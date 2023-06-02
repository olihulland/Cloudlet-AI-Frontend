import {
  WorkingData,
  Feature,
  RecordInstance,
  RecordInstanceProcessed,
} from "../data/types";
import { useEffect, useMemo } from "react";
import { solveFeature } from "../data/pre-processing/CommonOperations";

interface Props {
  features: Feature[];
  setWorkingData: (newData: WorkingData) => void;
  workingData: WorkingData;
  setIsProcessed: (isProcessed: boolean) => void;
  setProcessedData: (processedData: any) => void;
}

export const PreProcessor = ({
  features,
  setWorkingData,
  workingData,
  setIsProcessed,
  setProcessedData,
}: Props) => {
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
    setProcessedData(toReturn);
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
          console.log("newWorkingData", newWorkingData);
          setWorkingData(newWorkingData);
          setIsProcessed(true);
        }
      }
    }
  }, [processedData, workingData, setWorkingData]);

  return null;
};
