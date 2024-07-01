import fs from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import md5 from "md5";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const getProjects = async () => {
  let dirAll = await fs.readdir(
    `${join(__dirname, "../../", "src/effectnode/projects")}`
  );

  let projects = [];

  for (let kn in dirAll) {
    let dirOne = dirAll[kn];
    if (dirOne === ".DS_Store") {
      continue;
    }
    try {
      let graphStat = await fs.stat(
        `${join(
          __dirname,
          "../../",
          "src/effectnode/projects",
          dirOne,
          "graph.json"
        )}`
      );

      projects.push({
        _id: `${md5(__dirname + dirOne)}`,
        createdAt: graphStat.birthtime,
        updatedAt: graphStat.mtime,
        title: dirOne,
      });
    } catch (e) {
      console.log(e);
    }
  }

  return projects;
};

//
