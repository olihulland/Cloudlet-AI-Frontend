import { TrainingRequestData } from "./types";

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
  return status > 200 && status < 300;
};

export const setClassName = async ({
  id,
  name,
}: {
  id: number;
  name: string;
}) => {
  let formdata = new FormData();
  formdata.append("name", name);
  const response = await fetch(
    `${process.env.REACT_APP_API_URL}/name-class/${id}`,
    {
      method: "POST",
      body: formdata,
    }
  );
  const status = response.status;
  return status > 200 && status < 300;
};

export const ident = async () => {
  await fetch(`${process.env.REACT_APP_API_URL}/ident`);
};

export const requestTrainModel = async (modelInfo: TrainingRequestData) => {
  return await fetch(`${process.env.REACT_APP_API_URL}/train`, {
    method: "POST",
    body: JSON.stringify(modelInfo),
    headers: new Headers({ "content-type": "application/json" }),
  });
};
