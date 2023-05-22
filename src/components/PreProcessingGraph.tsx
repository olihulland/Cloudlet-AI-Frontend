import {
  Text as RechartsText,
  Legend,
  Scatter,
  ScatterChart,
  XAxis,
  YAxis,
  Tooltip,
  ZAxis,
} from "recharts";
import { Center, Text } from "@chakra-ui/react";
import { APIData, DataProcessed, Feature, WorkingData } from "../data/types";
import { useEffect, useMemo, useState } from "react";
import { solveFeature } from "../data/pre-processing/CommonOperations";
import { getClassName } from "../data/utils";

export const PreProcessingGraph = ({
  workingData,
  features,
  containerRef,
}: {
  workingData: WorkingData | undefined;
  features: Feature[] | undefined;
  containerRef: any;
}) => {
  const classes = useMemo(() => {
    if (!workingData || workingData.data === undefined) return [];
    const classes: { name: string; num: number }[] = [];
    workingData?.data?.record_instances.forEach((instance) => {
      const className = getClassName(
        instance.classification,
        workingData?.data as APIData | DataProcessed
      ).toString();
      if (!classes.find((c) => c.name === className))
        classes.push({ name: className, num: instance.classification });
    });
    return classes;
  }, [workingData]);

  const graphData = useMemo(() => {
    if (!features) return [];
    return classes.map(({ name: className, num: classNum }) => {
      return workingData?.data?.record_instances
        .filter((instance) => instance.classification === classNum)
        .map((instance) => {
          return features.map((feature, index) => {
            return {
              x: index,
              xName: feature.name,
              y: solveFeature(feature, instance),
              class: className,
            };
          });
        });
    });
  }, [workingData, features, classes]);

  const colours = [
    "#FF6347",
    "#FFD700",
    "#008080",
    "#FFC0CB",
    "#9932CC",
    "#FFA07A",
    "#6495ED",
    "#00FFFF",
    "#00FF00",
    "#FFA500",
  ];

  const [width, setWidth] = useState(600);
  useEffect(() => {
    const w = containerRef?.current?.clientWidth;
    if (w) setWidth(w * 0.8);
  }, [containerRef]);

  return (
    <Center>
      <ScatterChart
        width={width}
        height={500}
        margin={{
          top: 20,
          right: 20,
          bottom: 10,
          left: 10,
        }}
      >
        <XAxis
          dataKey="x"
          type="number"
          name="Feature"
          tickFormatter={(num) => (features ? features[num].name : num)}
          interval={"preserveStartEnd"}
        />
        <YAxis dataKey="y" type="number" name="Value" />
        <ZAxis dataKey="xName" type="category" name="Feature Name" />
        <ZAxis dataKey="class" type={"category"} name="Class" />
        {classes.map(({ name: className }, index) => {
          return (
            <Scatter
              key={index}
              name={className}
              data={graphData?.[index]?.flat()}
              fill={colours[index % colours.length]}
            />
          );
        })}

        <Legend />
        <Tooltip />
      </ScatterChart>
    </Center>
  );
};
