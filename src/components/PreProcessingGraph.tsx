import { Center, Text } from "@chakra-ui/react";
import { APIData, DataProcessed, Feature, WorkingData } from "../data/types";
import { useEffect, useMemo, useState } from "react";
import { solveFeature } from "../data/pre-processing/CommonOperations";
import { getClassName } from "../data/utils";
import { Scatter } from "react-chartjs-2";
import { getClassColour } from "../utils/colour";

export const PreProcessingGraph = ({
  workingData,
  features,
}: {
  workingData: WorkingData | undefined;
  features: Feature[] | undefined;
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
  }, [workingData, workingData?.data?.record_instances]);

  const graphData = useMemo(() => {
    if (!features) return [];
    let data: {
      label: string; // class name
      data: {
        x: string;
        y: number;
      }[];
      backgroundColor: string;
    }[] = [];

    // data normalised feature by feature
    let featureRanges = features.map((f) => {
      let max = -Infinity;
      let min = Infinity;
      workingData?.data?.record_instances.forEach((instance) => {
        const value = solveFeature(f, instance);
        if (value > max) max = value;
        if (value < min) min = value;
      });
      return { max, min, range: max - min };
    });
    console.log(featureRanges);

    classes.forEach((c, i) => {
      let d: {
        x: string;
        y: number;
      }[] = [];

      workingData?.data?.record_instances
        .filter((instance) => {
          return instance.classification === c.num;
        })
        .forEach((instance) => {
          features.forEach((feature, index) => {
            const value = solveFeature(feature, instance);
            const normalisedValue =
              (value - featureRanges[index].min) / featureRanges[index].range;
            d.push({
              x: feature.name,
              y: normalisedValue,
            });
          });
        });

      data.push({
        label: c.name,
        backgroundColor: getClassColour(i),
        data: d,
      });
    });

    return data;
  }, [workingData, features, classes]);

  return (
    <Center>
      <Scatter
        data={{ datasets: graphData, labels: features?.map((f) => f.name) }}
        options={{
          scales: {
            x: {
              type: "category",
              labels: features?.map((f) => f.name),
              title: {
                display: true,
                text: "Feature",
              },
            },
            y: {
              title: {
                display: true,
                text: "Value (plotted to be normalised by feature)",
              },
              ticks: {
                display: false,
              },
            },
          },
        }}
      />
    </Center>
  );
};
