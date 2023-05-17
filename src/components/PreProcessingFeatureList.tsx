import { Feature, WorkingData } from "../data/types";
import { VStack } from "@chakra-ui/react";
import { PreProcessingFeatureTile } from "./PreProcessingFeatureTile";

export const PreProcessingFeatureList = ({
  features,
  setFeatures,
  workingData,
}: {
  features: Feature[];
  setFeatures: (newFeatures: Feature[]) => void;
  workingData: WorkingData | undefined;
}) => {
  const calculatePossibleKeys = () => {
    if (!workingData) return [];
    let toReturn: string[] = [];
    workingData.data?.record_instances.forEach((record) => {
      record.data.forEach((data) => {
        let keys = Object.keys(data);
        keys.forEach((key) => {
          if (!toReturn.includes(key)) toReturn.push(key);
        });
      });
    });
    toReturn = toReturn.filter((key) => key !== "n");
    return toReturn;
  };

  const possibleKeys = calculatePossibleKeys();

  return (
    <VStack>
      {features.map((feature, index) => {
        return (
          <PreProcessingFeatureTile
            feature={feature}
            key={index}
            setFeature={(newFeature) => {
              let newFeatures = [...features];
              newFeatures[index] = newFeature;
              setFeatures(newFeatures);
            }}
            possibleKeys={possibleKeys}
          />
        );
      })}
    </VStack>
  );
};
