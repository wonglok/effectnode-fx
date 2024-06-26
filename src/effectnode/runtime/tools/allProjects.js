import { basename } from "path";
function loadCodes({ projectName }) {
  let codes = [];

  let rr = require.context("../../projects", true, /\/codes\/(.*).js$/, "lazy");

  let list = rr.keys();

  list.forEach((key) => {
    //

    if (key.startsWith("./") && key.includes(`/${projectName}/`)) {
      console.log(key);
      codes.push({
        _id: key,
        projectName: projectName,
        codeName: basename(key).replace(".js", ""),
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
        projectName: projectName,
        ...req(key),
        _id: key,
        codes: codes,
      });
    }
  });

  // console.log(projectGraphs);
  return projectGraphs;
}

// loadProjects(require.context("../projects", true, /graph\.json$/, "lazy"));
export const allProjects = loadProjects(
  require.context("../../projects", true, /graph\.json$/, "sync")
);
