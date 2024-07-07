import fs, { access, constants } from "fs/promises";
import fsSync from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const hasOneProject = async ({ title }) => {
  //

  const isHere = async (path) => {
    try {
      if (fsSync.accessSync(path, constants.R_OK)) {
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  };

  let projectURL = `${join(
    __dirname,
    "../../",
    "src/effectnode/projects/",
    `${title}/`,
    `graph.json`
  )}`;

  let url = projectURL;

  return await isHere(url);
};
