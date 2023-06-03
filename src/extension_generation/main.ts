import { RecordInstance, WorkingData } from "../data/types";
import { boilerplate } from "./tsGeneration/boilerplate";
import { blocksGenerator } from "./tsGeneration/blocks";
import { generateInterfaces } from "./tsGeneration/interfaces";
import { generateClasses } from "./tsGeneration/classes";
import { generateFeatureVector } from "./tsGeneration/featureVector";
import { generateEnumBlocks, generateEnums } from "./tsGeneration/enums";

export const getKeysFromRecordInstance = (record: RecordInstance) => {
  let keys = Object.keys(record.data[0]);
  keys = keys.filter((key) => key !== "n");
  return keys;
};

export const generateExtension = async (
  data: WorkingData
): Promise<{
  ts: string;
  modelCpp: string;
  modelH: string;
}> => {
  if (!data.data?.record_instances[0]) throw new Error("No data");
  if (!data.model) throw new Error("No model");

  const extensionTypescript = boilerplate(
    "movement",
    blocksGenerator(data) + "\n" + generateEnumBlocks(data),
    generateInterfaces(data) +
      "\n" +
      generateClasses(data) +
      "\n" +
      generateFeatureVector(data),
    "let onShouldAddDataPoint: (recording:Recording)=>void = (recording: Recording)=>null;",
    generateEnums(data)
  );

  const sendModelResult = await data.model.save(
    `${process.env.REACT_APP_API_URL}/model`
  );
  const response = sendModelResult?.responses?.[0];
  if (!response) throw new Error("No response from server");
  const modelText = await response.text();

  const lastLine = modelText.trim().split("\n").slice(-1)[0];
  const len = lastLine.split(" ").slice(-1)[0].trim().slice(0, -1);
  console.log(len);

  const modelCpp = `#include "model.h"
  
${modelText}`;

  const modelH = `#ifndef MODEL_H
#define MODEL_H

extern unsigned char model_tflite[${len}];
extern unsigned int model_tflite_len;

#endif // !MODEL_H`;

  return {
    ts: extensionTypescript,
    modelCpp: modelCpp,
    modelH: modelH,
  };
};
