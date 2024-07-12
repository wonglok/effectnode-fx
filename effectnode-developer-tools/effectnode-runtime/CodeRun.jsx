import md5 from "md5";
import { useEffect, useMemo, useState } from "react";
import { getID } from "./tools/getID";
import { create } from "zustand";

export function CodeRun({
  Algorithm = () => null,
  useStore,
  nodeID,
  domElement,
  socketMap,
  onLoop,
  useEditorStore,
  mode,
}) {
  let graph = useStore((r) => r.graph) || {};
  let nodes = graph.nodes;
  let edges = graph.edges;
  let nodeOne = nodes?.find((r) => r._id === nodeID);

  //
  let files = useStore((r) => r.files);
  let settings = useStore((r) => r.settings);
  let setting = settings.find((r) => r.nodeID === nodeID);

  //
  let [{ onClean, cleanAll }] = useState(() => {
    let api = {
      cleans: [],
      onClean: (v) => {
        api.cleans.push(v);
      },
      cleanAll: () => {
        api.cleans.forEach((t) => t());
        api.cleans = [];
      },
    };

    return api;
  });

  useEffect(() => {
    return () => {
      cleanAll();
    };
  }, [cleanAll]);

  let ui = useMemo(() => {
    return {
      on: (label, fnc) => {
        onClean(
          useStore.subscribe((state) => {
            let settings = state.settings;
            let setting = settings.find((r) => r.nodeID === nodeID);
            let datas = setting.data.filter((r) => r.label === label);
            if (datas.length > 1) {
              console.log("error, duplicated settings name", label);
            }
            [datas[0]]
              .filter((r) => r)
              .forEach((dat) => {
                fnc(dat.value);
              });
          })
        );

        useStore.setState({
          settings: [...useStore.getState().settings],
        });
      },
      // provide: ({
      //   label = "objectName",
      //   type = "text",
      //   defaultValue,
      //   ...config
      // }) => {
      //   //
      //   if (!["text", "range", "color", "number"].includes(type)) {
      //     throw new Error("not supported type: " + type);
      //   }
      //   if (type === "number") {
      //     type = "range";
      //   }

      //   let settings = useStore.getState().settings;
      //   let setting = settings.find((r) => r.nodeID === nodeOne?._id);
      //   if (!setting.data.some((r) => r.label === label)) {
      //     let entry = {
      //       _id: `${md5(getID())}`,
      //       label: `${label}`,
      //       type: `${type}`,
      //       value: defaultValue,
      //       ...config,
      //     };
      //     setting.data.push(entry);
      //   }

      //   let data = setting.data.find((r) => r.label === label);
      //   let output = {
      //     value: data.value,
      //     onChange: (fnc) => {
      //       return useStore.subscribe(() => {
      //         let data = setting.data.find((r) => r.label === label);
      //         output.value = data.value;
      //         fnc(data.value);
      //       });
      //     },
      //   };

      //   useStore.subscribe(() => {
      //     let data = setting.data.find((r) => r.label === label);
      //     output.value = data.value;
      //   });

      //   setTimeout(() => {
      //     useStore.setState({
      //       settings: JSON.parse(JSON.stringify(useStore.getState().settings)),
      //     });
      //   });

      //   return output;
      // },
    };
  }, [nodeID, onClean, useStore]);

  if (setting && setting?.data) {
    for (let userInput of setting.data) {
      ui[userInput.label] = userInput.value;
    }
  }

  let [io, setIO] = useState(false);
  useEffect(() => {
    let cleans = [];

    let ioPXY = new Proxy(
      {
        edgesLength: edges.length,
        //
      },
      {
        get: (obj, key) => {
          if (key.startsWith("out")) {
            return (idx, val) => {
              // let idx = Number(key.replace("out", ""));

              let node = nodeOne;
              let output = node.outputs[idx];

              let edges = useStore?.getState()?.graph?.edges || [];

              let destEdges = edges.filter((r) => r.output._id === output._id);
              destEdges.forEach((edge) => {
                socketMap.setState({
                  [edge.input._id]: val,
                });
              });
            };
          }

          if (key.startsWith("in")) {
            return (idx, handler = () => {}) => {
              return new Promise((resolve) => {
                //
                // let idx = Number(key.replace("in", ""));
                //

                let node = nodeOne;
                let input = node.inputs[idx];

                let clean = socketMap.subscribe((state, before) => {
                  if (
                    typeof state[input._id] !== "undefined" &&
                    state[input._id] !== before[input._id]
                  ) {
                    handler(state[input._id]);
                  }
                });

                let tt = setInterval(() => {
                  let val = socketMap.getState()[input._id];
                  if (typeof val !== "undefined") {
                    handler(val);
                    resolve(val);
                    clearInterval(tt);
                  }
                });

                cleans.push(clean);
              });
            };
          }
        },
        //
        //
      }
    );

    setIO(ioPXY);

    return () => {};
  }, [domElement, nodeOne, socketMap, useStore, edges?.length]);

  if (!useEditorStore) {
    useEditorStore = create(() => {
      return {};
    });
  }

  let extendAPI = {};
  //

  let diskSettings = useEditorStore((r) => r.settings);
  if (mode === "toolbox") {
    let diskSetting = diskSettings.find((r) => r.nodeID === nodeID);
    diskSetting.metaData = diskSetting.metaData || {};
    extendAPI.boxData = diskSetting.metaData;

    extendAPI.saveBoxData = () => {
      console.log("saving in saveBoxData");
      useEditorStore.setState({
        settings: diskSettings.map((r) => {
          if (r.nodeID === nodeID) {
            return diskSetting;
          }
          return r;
        }),
      });
    };
  }

  let runtimeSettings = useStore((r) => r.settings);
  if (mode === "runtime") {
    let runtimeSetting = runtimeSettings.find((r) => r.nodeID === nodeID);
    runtimeSetting.metaData = runtimeSetting.metaData || {};
    extendAPI.boxData = runtimeSetting.metaData;

    extendAPI.saveBoxData = () => {
      console.log("cant saveBoxData in runtime");
    };
  }

  //
  return (
    <>
      {io && socketMap && (
        <Algorithm
          //
          files={files}
          nodeID={nodeID}
          onLoop={onLoop}
          onClean={onClean}
          useStore={useStore}
          domElement={domElement}
          ui={ui}
          io={io}
          //
          {...extendAPI}
        ></Algorithm>
      )}
    </>
  );
}
