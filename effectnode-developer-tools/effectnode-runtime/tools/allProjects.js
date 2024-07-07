// import { useDeveloper } from "effectnode-developer-tools/effectnode-gui/store/useDeveloper";
import md5 from "md5";
import { basename, extname } from "path";
function loadImplementations({ projectName }) {
  let codes = [];

  if (process.env.NODE_ENV === "development") {
    let r0 = require.context(
      "raw-loader!src/components/",
      true,
      /(.*).(js|jsx|ts|tsx)$/
    );

    //
    //
    //
    let signatureCode = r0
      .keys()
      .reduce((ac, accessKey) => {
        ac.push(md5(r0(accessKey).default));
        return ac;
      }, [])
      .join("__");

    let rr = require.context(
      "src/effectnode/projects",
      true,
      /\/codes\/(.*).(js|jsx|ts|tsx)$/
    );

    let rawRaw = require.context(
      "raw-loader!src/effectnode/projects",
      true,
      /\/codes\/(.*).(js|jsx|ts|tsx)$/
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

          //
          signature:
            Object.values(rawRaw(key))
              .map((r) => md5(r))
              .join("-") + signatureCode,

          loadCode: async () => rr(key),
        };

        codes.push(item);
      }
      //
    });
  } else {
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
          signature: "",
          loadCode: async () => rr(key),
        };

        codes.push(item);
      }

      //

      //
    });
  }

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

export async function loadProjects({}) {
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

      let codes = loadImplementations({ projectName: projectName });

      let assets = loadAssets({ projectName: projectName });

      let signature = "";

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

  window.dispatchEvent(
    new CustomEvent("effectnode-signal", {
      detail: { projects: projectGraphs },
    })
  );

  window.addEventListener("request-effectnode-signal", () => {
    window.dispatchEvent(
      new CustomEvent("effectnode-signal", {
        detail: { projects: projectGraphs },
      })
    );
  });

  return projectGraphs;
}

if (typeof window !== "undefined") {
  loadProjects({});
}
