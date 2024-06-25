import * as React from "react";
import * as ReactDOM from "react-dom/client";
import path from "path";
import { transform } from "sucrase";
import * as R3F from "@react-three/fiber";
import * as Drei from "@react-three/drei";
import * as R3FPost from "@react-three/postprocessing";
import * as NativePost from "postprocessing";
import tunnel from "tunnel-rat";

export const compileNode = async ({
  title,
  nameSpaceID,
  nodes,
  modules,
  bootCode = "",
}) => {
  return new Promise(async (resolve) => {
    const rollupProm = import("rollup").then((r) => r.rollup); //2.56.3
    rollupProm.then(async (rollup) => {
      //
      try {
        //

        window[nameSpaceID] = window[nameSpaceID] || {};
        window[nameSpaceID].GV = window[nameSpaceID].GV || {};
        let Vars = window[nameSpaceID].GV;

        //
        Vars["react"] = React;
        Vars["react-dom"] = ReactDOM;
        Vars["@react-three/fiber"] = R3F;
        Vars["@react-three/drei"] = Drei;
        Vars["@react-three/postprocessing"] = R3FPost;
        Vars["postprocessing"] = NativePost;
        Vars["tunnel-rat"] = tunnel;

        window[nameSpaceID].NODE_MODULES = modules;

        let runtimePatcher = (Variable, idName) => {
          let str = `
            let NSGV = window["${nameSpaceID}"].GV;
          `;
          Object.entries(Variable).forEach(([key, val]) => {
            if (key === "default") {
              return;
            }

            str += `
    export const ${key} = NSGV["${idName}"]["${key}"];
`;
          });

          if (Variable.default) {
            str += `
    export default NSGV["${idName}"]["default"]
`;
          }

          return str;
        };

        let modulePatcher = (Variable, idName) => {
          let str = `
          
          `;
          Object.entries(Variable).forEach(([key, val]) => {
            if (key === "default") {
              return;
            }

            str += `
    export const ${key} = window["${nameSpaceID}"].NODE_MODULES.get("${idName}")["${key}"];
`;
          });

          if (Variable.default) {
            str += `
    export default window["${nameSpaceID}"].NODE_MODULES.get("${idName}")["default"]
`;
          }

          return str;
        };

        let bundle = rollup({
          input: `effectnode.bootloader.${title}.js`,
          plugins: [
            {
              name: "FS",
              async resolveId(source, importer) {
                if (!importer) {
                  // console.log(importee, 'importee')
                  return source;
                }

                if (source.startsWith("three")) {
                  if (source === "three") {
                    return "/jsrepo/three/build/three.module.js";
                  }

                  if (source === "three/nodes") {
                    return "/jsrepo/three/examples/jsm/nodes/Nodes.js";
                  }

                  if (source.startsWith("three/addons/")) {
                    return (
                      "/jsrepo/three/examples/jsm/" +
                      source.replace("three/addons/", "")
                    );
                  }
                  return;
                }
                //

                if (importer) {
                  let arr = importer.split("/");
                  arr.pop();
                  let parent = arr.join("/");
                  let joined = path.join(parent, source);
                  return joined;
                }
              },
              async load(id) {
                if (id === "not-self") {
                  return `
                    throw new Error('cannot import modle itself');
                  `;
                }

                if (id === `effectnode.bootloader.${title}.js`) {
                  let tCocde = transform(bootCode, {
                    transforms: ["jsx"],
                    preserveDynamicImport: true,
                    production: true,
                    jsxPragma: "React.createElement",
                    jsxFragmentPragma: "React.Fragment",
                  }).code;

                  return tCocde;
                }

                if (nodes.some((r) => r.title === id)) {
                  return new Promise((resolve) => {
                    let tt = setInterval(() => {
                      if (modules.has(id)) {
                        clearInterval(tt);

                        let str = ``;
                        str += `${modulePatcher(modules.get(id), id)}`;

                        resolve(str);
                      }
                    });
                    //
                    //
                  });
                }

                if (id in window[nameSpaceID].GV) {
                  return `${runtimePatcher(window[nameSpaceID].GV[id], id)}`;
                }

                if (id.startsWith(`/`)) {
                  return fetch(`${id}`)
                    .then((r) => {
                      return r.text();
                    })
                    .then((content) => {
                      let tCocde = transform(content, {
                        transforms: ["jsx"],
                        preserveDynamicImport: true,
                        production: true,
                        jsxPragma: "React.createElement",
                        jsxFragmentPragma: "React.Fragment",
                      }).code;

                      return tCocde;
                    });
                }

                return `
                    console.log('[not found]', ${id});
                `;
              },
            },
          ],
        });

        let bdn = await bundle;

        let parcel = await bdn.generate({
          output: { format: "esm", dir: "./dist" },
        });

        let rawOutputs = parcel.output;

        let outputs = rawOutputs;

        let blob = new Blob([outputs[0]?.code], {
          type: "application/javascript",
        });

        let url = URL.createObjectURL(blob);

        resolve({ url, outputs });
      } catch (er) {
        console.error(er);
      }
    });
  });
};
