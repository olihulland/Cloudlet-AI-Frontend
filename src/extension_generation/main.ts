import { RecordInstance, WorkingData } from "../data/types";
import { boilerplate } from "./boilerplate";
import { blocksGenerator } from "./blocks";
import { generateInterfaces } from "./interfaces";
import { generateClasses } from "./classes";
import { generateFeatureVector } from "./featureVector";

export const getKeysFromRecordInstance = (record: RecordInstance) => {
  let keys = Object.keys(record.data[0]);
  keys = keys.filter((key) => key !== "n");
  return keys;
};

export const generateExtension = (data: WorkingData) => {
  const model = data.model;
  const features = data.features;

  if (!data.data?.record_instances[0]) throw new Error("No data");

  console.log(
    boilerplate(
      "movement",
      blocksGenerator(data),
      generateInterfaces(data) +
        "\n" +
        generateClasses(data) +
        "\n" +
        generateFeatureVector(data),
      "let onShouldAddDataPoint: (recording:Recording)=>void = (recording: Recording)=>null;"
    )
  );
};
