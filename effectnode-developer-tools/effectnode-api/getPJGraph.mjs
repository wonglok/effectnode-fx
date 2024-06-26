import fs from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import write from "write";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const getPJGraph = async ({ title }) => {
  let graph = await fs.readFile(
    `${join(__dirname, "../../", `src/effectnode/projects/${title}/graph.json`)}`,
    "utf-8"
  );

  return JSON.parse(graph);
};

//

export const setPJGraph = async ({ title, edges }) => {
  let url = `${join(__dirname, "../../", `src/effectnode/projects/${title}/graph.json`)}`;

  let jsonString = JSON.stringify({
    edges,
  });

  await write(url, jsonString, {
    overwrite: true,
  });
};

//
