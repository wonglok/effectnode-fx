import { useDeveloper } from "effectnode-developer-tools/effectnode-gui/store/useDeveloper";
import { basename, extname } from "path";
function loadCodes({ projectName }) {
  let codes = [];

  let rr = require.context(
    "../../projects",
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

async function loadProjects({}) {
  let projectGraphs = [];

  //
  let req = require.context("../../projects", true, /graph\.json$/, "sync");
  req.keys().forEach((key) => {
    if (key.startsWith("./")) {
      //
      let projectName = key.replace("./", "").replace("/graph.json", "");

      let codes = loadCodes({ projectName: projectName });

      projectGraphs.push({
        _id: key,
        projectName: projectName,

        ...req(key),

        codes: codes,
      });
    }
  });

  // setTimeout(() => {
  //   onData({ projects: projectGraphs });
  // }, 1);

  window.dispatchEvent(
    new CustomEvent("effectNode", { detail: { projects: projectGraphs } })
  );
  window.addEventListener("requestEffectNode", () => {
    window.dispatchEvent(
      new CustomEvent("effectNode", { detail: { projects: projectGraphs } })
    );
  });
  //
  // console.log(projectGraphs);
  return projectGraphs;
}

// // loadProjects(require.context("../projects", true, /graph\.json$/, "lazy"));
// export const allProjects = loadProjects(
//   require.context("../../projects", true, /graph\.json$/, "sync")
// );

// loadProjects(require.context("../projects", true, /graph\.json$/, "lazy"));

if (typeof window !== "undefined") {
  loadProjects({ onData: () => {} });
}
export const getAllProjects = loadProjects;
