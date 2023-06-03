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

export const generateEnumBlocks = (data: WorkingData) => {
  if (!data.data?.classes) throw new Error("No class data");

  const labels = [...data.data.classes].sort((a, b) => a.id - b.id);

  return `
${labels
  .map((label, index) => {
    return `
  //% block="${label.name}"
  //% group="Possible prediction output values"
  //% weight=60
  export function ${label.name}_enum_const(): Classification {
    return ${index};
  }
`;
  })
  .join("\n")}

`;
};
