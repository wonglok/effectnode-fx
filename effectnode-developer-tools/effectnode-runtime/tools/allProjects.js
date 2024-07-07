// import { useDeveloper } from "effectnode-developer-tools/effectnode-gui/store/useDeveloper";
import { basename, extname } from "path";
function loadCodes({ projectName }) {
  let codes = [];

  let rr = require.context(
    "src/effectnode/projects",
    true,
    /\/codes\/(.*).(js|jsx|ts|tsx)$/,
    "lazy"
  );

  let list = rr.keys();

  list.forEach((key) => {
    // console.log(key);
    //

    if (key.startsWith("./") && key.includes(`/${projectName}/`)) {
      // console.log(key);
      let ext = extname(key);

      let codeName = basename(key).replace(ext, "");
      let item = {
        _id: key,
        projectName: projectName,
        codeName: codeName,
        fileName: basename(key),
        loadCode: async () => rr(key),
      };

      codes.push(item);
    }

    //

    //
  });

  return codes;
}

function loadAssets({ projectName }) {
  let bucket = [];

  let rr = require.context(
    "src/effectnode/projects",
    true,
    /\/assets\/(.*).(png|jpg|hdr|jpeg|glb|fbx|exr|mp4)$/,
    "sync"
  );

  let list = rr.keys();

  list.forEach((key) => {
    if (key.startsWith("./") && key.includes(`/${projectName}/`)) {
      let ext = extname(key);

      let codeName = basename(key).replace(ext, "");
      let item = {
        _id: key,
        projectName: projectName,
        codeName: codeName,
        fileName: basename(key),
        assetURL: rr(key),
      };

      bucket.push(item);
    }
  });

  return bucket;
}

// function loadCodeString({ projectName }) {
//   let bucket = [];

//   if (process.env.NODE_ENV === "development") {
//     let rr = require.context(
//       "src/effectnode/projects",
//       true,
//       /\/codes\/(.*).(js|jsx|ts|tsx)$/,
//       "sync"
//     );

//     let list = rr.keys();

//     list.forEach((key) => {
//       if (key.startsWith("./") && key.includes(`/${projectName}/`)) {
//         // let ext = extname(key);

//         // let codeName = basename(key).replace(ext, "");
//         let mod = rr(key);

//         let Runtime = "";
//         if (mod?.Runtime) {
//           Runtime = mod.Runtime.toString();
//         }
//         let ToolBox = "";
//         if (mod?.ToolBox) {
//           ToolBox = mod.ToolBox.toString();
//         }
//         let item = {
//           _id: key,
//           projectName: projectName,
//           // codeName: codeName,
//           // fileName: basename(key),
//           codeString: JSON.stringify({
//             Runtime: Runtime,
//             ToolBox: ToolBox,
//           }),
//         };

//         bucket.push(item);
//       }
//     });
//   }

//   return bucket;
// }

async function loadProjects({}) {
  let projectGraphs = [];

  //
  let req = require.context(
    "src/effectnode/projects",
    true,
    /graph\.json$/,
    "sync"
  );

  let allkeys = req.keys();

  allkeys.forEach((key) => {
    if (key.startsWith("./")) {
      //
      let projectName = key.replace("./", "").replace("/graph.json", "");

      let codes = loadCodes({ projectName: projectName });

      let assets = loadAssets({ projectName: projectName });

      let signature = "";

      // if (process.env.NODE_ENV === "development") {
      //   signature = loadCodeString({ projectName: projectName }).join("");
      // }

      projectGraphs.push({
        _id: key,
        projectName: projectName,

        ...req(key),

        signature: signature,
        codes: codes,
        assets: assets,
      });
    }
  });

  // window.dispatchEvent(
  //   new CustomEvent("effectNode", { detail: { projects: projectGraphs } })
  // );

  // window.addEventListener("requestEffectNodeProjectJSON", () => {
  //   window.dispatchEvent(
  //     new CustomEvent("effectNode", { detail: { projects: projectGraphs } })
  //   );
  // });

  return projectGraphs;
}

// if (typeof window !== "undefined") {
//   loadProjects({});
// }

export const getAllProjects = loadProjects;
