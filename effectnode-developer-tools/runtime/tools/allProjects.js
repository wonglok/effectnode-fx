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
      codes.push({
        _id: key,
        projectName: projectName,
        codeName: codeName,
        fileName: basename(key),
        loadCode: async () => rr(key),
      });
    }

    //
  });

  return codes;
}

function loadProjects(req) {
  let projectGraphs = [];
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

  // console.log(projectGraphs);
  return projectGraphs;
}

// loadProjects(require.context("../projects", true, /graph\.json$/, "lazy"));
export const allProjects = loadProjects(
  require.context("src/effectnode/projects", true, /graph\.json$/, "sync")
);
