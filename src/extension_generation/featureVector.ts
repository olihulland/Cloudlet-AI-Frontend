import { CommonFeatureCalculator, WorkingData } from "../data/types";
import { CommonOperations } from "../data/pre-processing/CommonOperations";
import { getKeysFromRecordInstance } from "./main";

export const generateFeatureVector = (data: WorkingData): string => {
  if (!data.features) throw new Error("No features");
  if (!data.data?.record_instances[0]) throw new Error("No data");

  let keys = getKeysFromRecordInstance(data.data.record_instances[0]);

  return `
  const max = (data: number[]) => {
    let max = data[0];
    for (let i = 1; i < data.length; i++) {
      if (data[i] > max) max = data[i];
    }
    return max;
  };
  
  const min = (data: number[]) => {
    let min = data[0];
    for (let i = 1; i < data.length; i++) {
      if (data[i] < min) min = data[i];
    }
    return min;
  };
  
  const mean = (data: number[]) => {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i];
    }
    return sum / data.length;
  };
  
  const std = (data: number[]) => {
    let m = mean(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += (data[i] - m) ** 2;
    }
    return Math.sqrt(sum / data.length);
  };
  
  const featureVector = (recording: Recording): number[] => {
    const data = recording.getData();
    let fv = [];
    
    ${keys
      .map((key) => `const ${key}_arr = data.map((d)=>d['${key}']);`)
      .join("\n  ")}
    
    ${data.features
      .map((feature) => {
        let code;
        if ((feature.calculate as CommonFeatureCalculator).op !== undefined) {
          code = "// Common feature calculator";
          const cFC = feature.calculate as CommonFeatureCalculator;
          switch (cFC.op) {
            case CommonOperations.Max:
              code += `
              const ${feature.name.replace(" ", "_")}_max = max(${cFC.key}_arr);
              fv.push(${feature.name.replace(" ", "_")}_max);`;
              break;
            case CommonOperations.Min:
              code += `
              const ${feature.name.replace(" ", "_")}_min = min(${cFC.key}_arr);
              fv.push(${feature.name.replace(" ", "_")}_min);`;
              break;
            case CommonOperations.Mean:
              code += `
              const ${feature.name.replace(" ", "_")}_mean = mean(${
                cFC.key
              }_arr);
              fv.push(${feature.name.replace(" ", "_")}_mean);`;
              break;
            case CommonOperations.Std:
              code += `
              const ${feature.name.replace(" ", "_")}_std = std(${cFC.key}_arr);
              fv.push(${feature.name.replace(" ", "_")}_std);`;
              break;
          }
        } else
          code = `// Custom feature calculator
      
        const ${feature.name.replace(
          " ",
          "_"
        )}_fn = (dataIn: DataPoint[]): number => {         
          ${feature.calculate
            .toString()
            .replace("record.data", "dataIn")
            .replace("record?.data", "dataIn")}
        };
        fv.push(${feature.name.replace(" ", "_")}_fn(data));`;

        return `// ${feature.name}
        ${code}
        `;
      })
      .join("\n    ")}
      
      return fv;
  };
`;
};
