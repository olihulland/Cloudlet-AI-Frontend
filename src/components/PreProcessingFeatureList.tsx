import { Feature, WorkingData } from "../data/types";
import { Button, Flex, Center } from "@chakra-ui/react";
import { PreProcessingFeatureTile } from "./PreProcessingFeatureTile";
import { AddIcon } from "@chakra-ui/icons";
import { CommonOperations } from "../data/pre-processing/CommonOperations";

export const PreProcessingFeatureList = ({
  features,
  setFeatures,
  workingData,
  setWorkingData,
}: {
  features: Feature[];
  setFeatures: (newFeatures: Feature[]) => void;
  workingData: WorkingData | undefined;
  setWorkingData: ((newWorkingData: WorkingData) => void) | undefined;
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

  const updateFeatures = (updatedFeatures: Feature[]) => {
    setFeatures(updatedFeatures);
    if (setWorkingData && workingData) {
      setWorkingData({
        ...workingData,
        features: updatedFeatures,
      });
    }
  };

  const possibleKeys = calculatePossibleKeys();

  return (
    <>
      <Flex flexWrap={"wrap"} gap={2} justifyContent={"space-evenly"}>
        {features.map((feature, index) => {
          return (
            <PreProcessingFeatureTile
              feature={feature}
              key={index}
              setFeature={(newFeature) => {
                let newFeatures = [...features];
                if (newFeature === undefined) newFeatures.splice(index, 1);
                else newFeatures[index] = newFeature;
                updateFeatures(newFeatures);
              }}
              possibleKeys={possibleKeys}
              workingData={workingData}
            />
          );
        })}
      </Flex>
      <Center>
        <Button
          mt={5}
          w={"full"}
          maxW={"lg"}
          leftIcon={<AddIcon />}
          colorScheme={"green"}
          onClick={() => {
            let newFeatures = [...features];
            newFeatures.push({
              name: "New Feature",
              description: "Description",
              calculate: {
                op: CommonOperations.Mean,
                key: possibleKeys[0],
              },
            });
            updateFeatures(newFeatures);
          }}
          boxShadow={"md"}
        >
          Add Feature
        </Button>
      </Center>
    </>
  );
};
