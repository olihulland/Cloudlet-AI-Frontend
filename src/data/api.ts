export const getData = async () => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/data`);
  const data = await response.json();
  return data;
};

export const deleteRecord = async (id: string) => {
  const response = await fetch(`${process.env.REACT_APP_API_URL}/data/${id}`, {
    method: "DELETE",
  });
  const status = response.status;
  if (status > 200 && status < 300) {
    return true;
  } else {
    return false;
  }
};
