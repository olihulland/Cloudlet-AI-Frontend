import { Center, Text } from "@chakra-ui/react";
import { APIData, DataProcessed, Feature, WorkingData } from "../data/types";
import { useEffect, useMemo, useState } from "react";
import { solveFeature } from "../data/pre-processing/CommonOperations";
import { getClassName } from "../data/utils";
import { Scatter } from "react-chartjs-2";

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
            d.push({
              x: feature.name,
              y: value,
            });
          });
        });

      data.push({
        label: c.name,
        backgroundColor: colours[i % colours.length],
        data: d,
      });
    });

    // TODO normalise by feature
    // const combinedData = data.map((d) => d.data).flat();
    // const featureRanges: {
    //   fName: string;
    //   min: number;
    //   max: number;
    //   range: number;
    // }[] = [];
    // features.forEach((f, i) => {
    //   const values = combinedData.filter((d) => d.x === f.name).map((d) => d.y);
    //   featureRanges.push({
    //     fName: f.name,
    //     min: Math.min(...values),
    //     max: Math.max(...values),
    //     range: Math.max(...values) - Math.min(...values),
    //   });
    // });
    // console.log("feature ranges", featureRanges);
    //
    // const biggestRange = featureRanges.reduce((prev, curr) =>
    //   prev.range > curr.range ? prev : curr
    // );
    // console.log("biggest range", biggestRange);

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
            },
          },
        }}
      />
    </Center>
  );
};
