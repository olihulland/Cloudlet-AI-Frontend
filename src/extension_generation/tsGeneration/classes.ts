import { WorkingData } from "../../data/types";

export const generateClasses = (wd: WorkingData) => {
  return `
  class Recording {
    private data: DataPoint[];
  
    constructor() {
      this.data = [];
    }
    
    addDataPoint(dataPoint: DataPoint) {
      this.data.push(dataPoint);
    }
    
    getData() {
      return this.data;
    }
  }
`;
};
