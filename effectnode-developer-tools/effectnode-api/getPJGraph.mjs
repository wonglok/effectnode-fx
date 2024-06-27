import fs from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import write from "write";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const getPJGraph = async ({ title }) => {
  let json = await fs.readFile(
    `${join(__dirname, "../../", `src/effectnode/projects/${title}/graph.json`)}`,
    "utf-8"
  );

  return JSON.parse(json);
};

//

export const setPJGraph = async ({ title, json }) => {
  let url = `${join(__dirname, "../../", `src/effectnode/projects/${title}/graph.json`)}`;

  let jsonString = JSON.stringify(json, null, "  ");

  await write(url, jsonString, {
    overwrite: true,
  });
};

//
