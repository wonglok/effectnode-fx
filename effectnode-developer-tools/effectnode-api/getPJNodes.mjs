import fs, { access } from "fs/promises";
import { join, dirname, basename } from "path";
import { fileURLToPath } from "url";
import md5 from "md5";
import { constants } from "fs";
import write from "write";

const __dirname = dirname(fileURLToPath(import.meta.url));

export const getPJNodes = async ({ title }) => {
  //

  let dirAll = await fs.readdir(
    `${join(__dirname, "../../", `src/effectnode/projects/${title}/nodes`)}`
  );

  let array = [];

  for (let kn in dirAll) {
    let dirOne = dirAll[kn];

    let fileURL = `${join(
      __dirname,
      "../../",
      "src/effectnode/projects",
      `${title}`,
      "/nodes/",
      dirOne,
      "./node.json"
    )}`;

    let nodeFile = await fs.readFile(fileURL, "utf-8");

    let node = JSON.parse(nodeFile.trim());

    array.push(node);
  }

  return array;
};

//

export const setPJNodes = async ({ title, nodes }) => {
  //

  for (let node of nodes) {
    let fileURL = `${join(
      __dirname,
      "../../",
      "src/effectnode/projects",
      `${title}`,
      "/nodes/",
      node.title,
      "./node.json"
    )}`;

    let data = JSON.stringify(node, null, "  ");
    await write(fileURL, data, {
      overwrite: true,
    });

    const fexists = async (path) => {
      try {
        await access(path);
        return true;
      } catch {
        return false;
      }
    };

    let codeURL = `${join(
      __dirname,
      "../../",
      "src/effectnode/projects",
      `${title}`,
      "/nodes/",
      node.title,
      "./code.js"
    )}`;

    if (await fexists(codeURL)) {
    } else {
      await write(codeURL, "", {
        overwrite: true,
      });
    }
  }

  /*
   */
  // //
  // let oldNodes = await getPJNodes({ title });

  // let needsToRemove = oldNodes.filter((r) => {
  //   return !nodes.some((nn) => nn.title === r.title);
  // });

  // let waits = needsToRemove.map((it) => {
  //   //
  //   let pathToRemove = `${join(
  //     __dirname,
  //     `../../`,
  //     `src/effectnode/projects`,
  //     `${title}`,
  //     `/nodes/`,
  //     it.title,
  //     `/`
  //   )}`;

  //   return fs.rm(pathToRemove, {
  //     recursive: true,
  //     force: true,
  //   });
  // });

  // await Promise.all(waits);

  return nodes;
};

//
