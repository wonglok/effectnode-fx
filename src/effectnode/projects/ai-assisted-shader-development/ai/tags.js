import { getOllama } from "./ollama";

export const getTags = async () => {
  let result = await fetch(getOllama() + "/api/tags").then((r) => r.json());
  return result;
};
