// 10 pretty secondary/pastel colours for a line graph
export const colours = [
  "#FFA07A",
  "#00CED1",
  "#FFD700",
  "#7B68EE",
  "#F08080",
  "#3CB371",
  "#FF6347",
  "#00FFFF",
  "#BA55D3",
  "#87CEEB",
];

export const boldClassColours = [
  "#0000FF",
  "#00FF00",
  "#FF0000",
  "#FFA500",
  "#FF00FF",
  "#00FFFF",
  "#FFFF00",
  "#008000",
];

export const classColourSchemes = [
  "blue",
  "green",
  "red",
  "orange",
  "purple",
  "cyan",
  "yellow",
  "darkgreen",
];

export const getClassColour = (classID: number) => {
  return boldClassColours[classID % colours.length];
};

export const getClassColourScheme = (classID: number | undefined) => {
  if (classID === undefined) {
    return "grey";
  }
  return classColourSchemes[classID % classColourSchemes.length];
};
