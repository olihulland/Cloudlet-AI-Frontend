import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogOverlay,
  Box,
  Button,
  Card,
  CardBody,
  Center,
  Flex,
  Heading,
  HStack,
  IconButton,
  Input,
  Select,
  Spacer,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { CloseIcon, EditIcon, RepeatIcon, DeleteIcon } from "@chakra-ui/icons";
import {
  CommonFeatureCalculator,
  Feature,
  FeatureCalculatorFunction,
  RecordInstance,
  WorkingData,
} from "../data/types";
import { useEffect, useRef, useState } from "react";
import {
  CommonOperations,
  isCommon,
} from "../data/pre-processing/CommonOperations";
import CodeEditor from "@uiw/react-textarea-code-editor";
import JSONPretty from "react-json-pretty";

export const PreProcessingFeatureTile = ({
  feature,
  setFeature,
  possibleKeys,
  workingData,
}: {
  feature: Feature;
  setFeature: (newFeature: Feature | undefined) => void;
  possibleKeys: string[];
  workingData: WorkingData | undefined;
}) => {
  const [name, setName] = useState<string>();
  const [description, setDescription] = useState<string>();

  const [op, setOp] = useState<CommonOperations>();
  const [key, setKey] = useState<string>();

  const [code, setCode] = useState<string>();
  const [codeError, setCodeError] = useState<boolean>();

  const viewJSONDisclosure = useDisclosure();
  const cancelRef: any = useRef();
  const JSONPrettyTheme = require("react-json-pretty/dist/acai");

  useEffect(() => {
    try {
      if (code === undefined) {
        setCodeError(true);
        return;
      }
      let fn = new Function("record", code);
      // @ts-ignore
      let res = fn.call(null, { data: [] } as RecordInstance);
      if (res === undefined || typeof res !== "number") throw new Error();
      return setCodeError(false);
    } catch (e) {
      return setCodeError(true);
    }
  }, [code]);

  useEffect(() => {
    setName(feature.name);
    setDescription(feature.description);

    if (isCommon(feature.calculate)) {
      const cfc = feature.calculate as CommonFeatureCalculator;
      setOp(cfc.op);
      setKey(cfc.key);
    } else {
      setCode(feature.calculate.toString());
    }
  }, [feature]);

  const changeName = (newName: string) => {
    setName(newName);
    setFeature({ ...feature, name: newName });
  };

  const changeDescription = (newDescription: string) => {
    setDescription(newDescription);
    setFeature({ ...feature, description: newDescription });
  };

  const becomeCommon = () => {
    setFeature({
      ...feature,
      calculate: {
        op: CommonOperations.Mean,
        key: possibleKeys[0],
      },
    });
  };

  const becomeCustom = () => {
    setFeature({
      ...feature,
      calculate: `// input is 'record' which is a record instance
// the return value must be a number representing the value of the feature after processing
  
const input = record;
const theDataPoints = record.data;

return 0;`,
    });
  };

  // @ts-ignore
  // @ts-ignore
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
          <IconButton
            aria-label={"Remove Feature"}
            onClick={() => {
              // eslint-disable-next-line no-restricted-globals
              if (confirm("Are you sure you want to delete this feature?")) {
                setFeature(undefined);
              }
            }}
            icon={<DeleteIcon />}
            colorScheme={"red"}
          />
        </Flex>
        <Box p={3} rounded={"lg"} borderWidth={1} mt={3} w={"full"}>
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
            <>
              <Box p={1} my={3}>
                <Text>
                  Custom code. Must return number and can access record instance
                  using variable record. Show basic example. Show record data
                  structure.
                </Text>
                <CodeEditor
                  value={code}
                  language={"javascript"}
                  padding={10}
                  onChange={(e) => {
                    setCode(e.target.value);
                  }}
                  style={{
                    width: "100%",
                    fontFamily: '"Fira code", "Fira Mono", monospace',
                    fontSize: 12,
                  }}
                />
                <Flex gap={2} mt={2}>
                  <Button
                    isDisabled={code === feature.calculate.toString()}
                    onClick={() => {
                      setCode(feature.calculate.toString());
                    }}
                    colorScheme={"red"}
                  >
                    Reset
                  </Button>
                  <Spacer />
                  <Button
                    onClick={() => {
                      viewJSONDisclosure.onOpen();
                    }}
                  >
                    View first record
                  </Button>
                  <Button
                    isDisabled={codeError}
                    onClick={() => {
                      if (code === undefined) return;
                      let fn = new Function(
                        "record",
                        code
                      ) as FeatureCalculatorFunction;
                      if (workingData?.data?.record_instances)
                        alert(
                          fn.call(null, workingData?.data?.record_instances[0])
                        );
                    }}
                  >
                    Test on first record
                  </Button>
                </Flex>
              </Box>
              <AlertDialog
                leastDestructiveRef={cancelRef}
                isOpen={viewJSONDisclosure.isOpen}
                onClose={viewJSONDisclosure.onClose}
                size={"5xl"}
              >
                <AlertDialogOverlay>
                  <AlertDialogContent>
                    <AlertDialogHeader fontSize="lg" fontWeight="bold">
                      <Flex>
                        <Center>
                          <Heading size={"sm"}>First Record</Heading>
                        </Center>
                        <Spacer />
                        <IconButton
                          aria-label={"Close"}
                          onClick={viewJSONDisclosure.onClose}
                          icon={<CloseIcon />}
                          variant={"ghost"}
                          size={"sm"}
                        />
                      </Flex>
                    </AlertDialogHeader>
                    <Box px={5} pb={5}>
                      <JSONPretty
                        id="json-pretty"
                        data={{
                          ...workingData?.data?.record_instances[0],
                          featureVector: undefined,
                        }}
                        theme={JSONPrettyTheme}
                        mainStyle="padding:1em"
                      />
                    </Box>
                  </AlertDialogContent>
                </AlertDialogOverlay>
              </AlertDialog>
            </>
          )}
          <Flex mt={2}>
            <Button
              leftIcon={<RepeatIcon />}
              onClick={() => {
                if (
                  // eslint-disable-next-line no-restricted-globals
                  !confirm(
                    "Are you sure?\nYou will lose the current processing setup!"
                  )
                )
                  return;
                if (isCommon(feature.calculate)) {
                  becomeCustom();
                } else {
                  becomeCommon();
                }
              }}
            >
              Switch to{" "}
              {isCommon(feature.calculate) ? "Custom" : "Standardised"}{" "}
              Processing
            </Button>
            <Spacer />
            <Button
              isDisabled={
                isCommon(feature.calculate)
                  ? op === (feature.calculate as CommonFeatureCalculator).op &&
                    key === (feature.calculate as CommonFeatureCalculator).key
                  : codeError || code === feature.calculate.toString()
              }
              onClick={() => {
                if (!isCommon(feature.calculate) && code !== undefined) {
                  setFeature({ ...feature, calculate: code });
                } else if (op !== undefined && key !== undefined) {
                  setFeature({
                    ...feature,
                    calculate: {
                      op: op,
                      key: key,
                    },
                  });
                }
              }}
              leftIcon={<EditIcon />}
              colorScheme={"green"}
            >
              Update Processing
            </Button>
          </Flex>
        </Box>
      </CardBody>
    </Card>
  );
};