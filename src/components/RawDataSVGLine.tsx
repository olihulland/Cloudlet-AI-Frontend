import { DataPoint } from "../data/types";
import { Box, HStack, VStack, Text, Flex } from "@chakra-ui/react";
import { useMemo } from "react";
import { colours } from "../utils/colour";

export const RawDataSVGLine = ({ data }: { data: DataPoint[] }) => {
  const width = 400;
  const height = 100;

  // combine all bits of data into one array unless key is "n"
  const combinedData = useMemo(() => {
    if (data.length === 0) return [];
    let combinedData: number[] = [];
    data.forEach((d) => {
      Object.keys(d).forEach((key) => {
        if (key !== "n") combinedData.push(d[key]);
      });
    });
    return combinedData;
  }, [data]);

  const top = useMemo(() => {
    if (combinedData.length === 0) return 0;
    return Math.max(...combinedData) + 200;
  }, [combinedData]);

  const bottom = useMemo(() => {
    if (combinedData.length === 0) return 0;
    return Math.min(...combinedData) - 200;
  }, [combinedData]);

  // all keys except "n" sorted by their value at the last data point
  const keys = useMemo(() => {
    if (data.length === 0) return [];
    let k = Object.keys(data[0]).filter((key) => key !== "n");
    return k.sort((a, b) => {
      return data[data.length - 1][b] - data[data.length - 1][a];
    });
  }, [data]);

  return (
    <Flex>
      <Box w={width} h={height}>
        <svg viewBox={`0 0 ${width} ${height}`}>
          {keys.map((key, i) => {
            return (
              <polyline
                fill={"none"}
                stroke={colours[i % colours.length]}
                strokeWidth={2}
                points={`
                ${data.map((d, i) => {
                  return `${(width / data.length) * i},${-(
                    (height / (top - bottom)) * d[key] +
                    (height / (top - bottom)) * bottom
                  )}`;
                })}
              `}
              />
            );
          })}
        </svg>
      </Box>
      <VStack>
        {keys.map((key, i) => {
          return (
            <HStack>
              <Box
                w={3}
                h={3}
                bg={colours[i % colours.length]}
                borderRadius="full"
              />
              <Text>{key}</Text>
            </HStack>
          );
        })}
      </VStack>
    </Flex>
  );
};
