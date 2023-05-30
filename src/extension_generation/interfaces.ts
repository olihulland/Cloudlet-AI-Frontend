import { WorkingData } from "../data/types";
import { getKeysFromRecordInstance } from "./main";

export const generateInterfaces = (wd: WorkingData) => {
  if (!wd.data?.record_instances[0]) throw new Error("No data");
  const keys = getKeysFromRecordInstance(wd.data.record_instances[0]);
  return `
  interface DataPoint {
  ${keys.map((key) => `  ${key}: number;`).join("\n  ")}
  }
  `;
};
