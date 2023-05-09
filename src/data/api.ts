export const getData = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/data`);
  const data = await response.json();
  return data;
};
