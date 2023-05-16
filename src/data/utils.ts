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
