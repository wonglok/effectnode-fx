import fs, { access, constants } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const hasOneProject = async ({ title }) => {
  //

  const fexists = async (path) => {
    try {
      await fs.stat(path);
      return true;
    } catch {
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

  return await fexists(url);
};
