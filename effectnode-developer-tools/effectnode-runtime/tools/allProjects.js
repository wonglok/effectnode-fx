// import { useDeveloper } from "effectnode-developer-tools/effectnode-gui/store/useDeveloper";
// import md5 from "md5";

import { basename, extname } from "path";

function loadImplementations({ projectName }) {
  let codes = [];

  let rr = require.context(
    "src/effectnode/projects",
    true,
    /\/codes\/(.*).(js|jsx|ts|tsx)$/,
    "lazy"
  );

  let list = rr.keys();

  list.forEach((key) => {
    //

    if (key.startsWith("./") && key.includes(`/${projectName}/`)) {
      let ext = extname(key);

      let codeName = basename(key).replace(ext, "");
      let item = {
        _id: key,
        projectName: projectName,
        codeName: codeName,
        fileName: basename(key),
        signature: "",
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

export async function loadProjects({ projectName }) {
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
    // && key.includes(projectName)
    if (key.startsWith("./")) {
      //
      let projectName = key.replace("./", "").replace("/graph.json", "");
      //

      let codes = loadImplementations({ projectName: projectName });

      let assets = loadAssets({ projectName: projectName });

      projectGraphs.push({
        _id: key,
        projectName: projectName,

        ...req(key),

        codes: codes,
        assets: assets,
      });
    }
  });

  return projectGraphs;
}

//
