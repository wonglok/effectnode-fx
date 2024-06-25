import fs from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const hasOneProject = async ({ title }) => {
  let dirAll = await fs.readdir(
    `${join(__dirname, "../../", "src/effectnode/projects")}`
  );

  let hasDir = dirAll.includes(title);

  return hasDir;
};
