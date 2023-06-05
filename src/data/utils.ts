import { APIData, DataProcessed } from "./types";

export const getFriendlyMicrobitID = (
  deviceID: string,
  data: APIData | DataProcessed
) => {
  const microbit = data.microbits.find(
    (microbit) => microbit.deviceID.toString() === deviceID.toString()
  );
  return microbit?.friendlyID;
};

export const getClassName = (
  classification: number,
  data: APIData | DataProcessed
) => {
  const classInfo = data.classes.find(
    (classInfo) => classInfo.id.toString() === classification.toString()
  );
  return classInfo?.name == null || classInfo.name === ""
    ? classification
    : classInfo.name;
};

export const getClassNameUnsafe = (
  classification: number,
  data: APIData | DataProcessed
) => {
  const classInfo = data.classes.find(
    (classInfo) => classInfo.id.toString() === classification.toString()
  );
  return classInfo?.name;
};
