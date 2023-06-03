import { WorkingData } from "../../data/types";

export const generateEnums = (data: WorkingData) => {
  if (!data.data?.classes) throw new Error("No class data");

  const labels = [...data.data.classes].sort((a, b) => a.id - b.id);
  const labelsEnum = `
enum Classification {
  ${labels.map((label, index) => `${label.name} = ${index}`).join(",\n    ")}
}`;
  return (
    labelsEnum +
    `
  
type PredictionError = number;`
  );
};
