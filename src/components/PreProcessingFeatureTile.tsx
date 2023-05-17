import {
  Card,
  CardBody,
  Box,
  Flex,
  Input,
  Text,
  Heading,
  HStack,
  Select,
} from "@chakra-ui/react";
import { CommonFeatureCalculator, Feature } from "../data/types";
import { useEffect, useState } from "react";
import {
  CommonOperations,
  isCommon,
} from "../data/pre-processing/CommonOperations";

export const PreProcessingFeatureTile = ({
  feature,
  setFeature,
  possibleKeys,
}: {
  feature: Feature;
  setFeature: (newFeature: Feature) => void;
  possibleKeys: string[];
}) => {
  const [name, setName] = useState<string>();
  const [description, setDescription] = useState<string>();

  const [op, setOp] = useState<CommonOperations>();
  const [key, setKey] = useState<string>();

  useEffect(() => {
    setName(feature.name);
    setDescription(feature.description);

    if (isCommon(feature.calculate)) {
      const cfc = feature.calculate as CommonFeatureCalculator;
      setOp(cfc.op);
      setKey(cfc.key);
    }
  }, [feature]);

  useEffect(() => {
    if (op !== undefined && key !== undefined) {
      let newFeature: Feature = {
        ...feature,
        calculate: {
          op: op,
          key: key,
        },
      };
      setFeature(newFeature);
    }
  }, [op, key]);

  const changeName = (newName: string) => {
    setName(newName);
    setFeature({ ...feature, name: newName });
  };

  const changeDescription = (newDescription: string) => {
    setDescription(newDescription);
    setFeature({ ...feature, description: newDescription });
  };

  return (
    <Card w={"full"}>
      <CardBody>
        <Flex gap={3}>
          <Box>
            <Input value={name} onChange={(e) => changeName(e.target.value)} />{" "}
          </Box>
          <Input
            value={description}
            onChange={(e) => changeDescription(e.target.value)}
          />
        </Flex>
        <Box p={3} rounded={"lg"} borderWidth={1} mt={3}>
          <Heading size={"sm"}>Processing</Heading>
          {isCommon(feature.calculate) ? (
            <Flex justifyContent={"space-around"}>
              <HStack>
                <Text>Operation:</Text>
                <Select
                  value={op}
                  onChange={(e) => {
                    setOp(parseInt(e.target.value) as CommonOperations);
                  }}
                >
                  {Object.values(CommonOperations)
                    .slice(0, Object.values(CommonOperations).length / 2)
                    .map((op, index) => {
                      return (
                        <option value={Object.keys(CommonOperations)[index]}>
                          {op}
                        </option>
                      );
                    })}
                </Select>
              </HStack>
              <HStack>
                <Text>On data:</Text>
                <Select
                  value={key}
                  onChange={(e) => {
                    setKey(e.target.value);
                  }}
                >
                  {possibleKeys.map((key) => {
                    return <option value={key}>{key}</option>;
                  })}
                </Select>
              </HStack>
            </Flex>
          ) : (
            <Text>Custom</Text>
          )}
        </Box>
      </CardBody>
    </Card>
  );
};
