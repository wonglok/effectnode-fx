// import md5 from "md5";
import { useCallback, useEffect, useMemo, useState } from "react";
import { getID } from "./tools/getID";
import { create } from "zustand";
import md5 from "md5";

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
      useSet: (
        label,
        defaultValue = 0,
        { type = "range", ...config } = { type: "range", min: -1, max: 1 }
      ) => {
        let [value, setValue] = useState(defaultValue);

        useEffect(() => {
          // //
          if (!["text", "range", "color", "number"].includes(type)) {
            throw new Error("not supported type: " + type);
          }

          let finalType = type;
          if (finalType === "number") {
            finalType = "range";
          }

          let useAdapter = useEditorStore || useStore;

          let tt = setInterval(() => {
            let settings = useAdapter.getState().settings;
            if (settings) {
              clearInterval(tt);
              let setting = settings.find((r) => r.nodeID === nodeID);
              if (setting && !setting.data.some((r) => r.label === label)) {
                let entry = {
                  _id: `${md5(getID())}`,
                  label: `${label}`,
                  type: `${finalType}`,
                  value: defaultValue,
                  ...config,
                };
                setting.data.push(entry);

                //
                useAdapter.setState({
                  settings: JSON.parse(
                    JSON.stringify(useAdapter.getState().settings)
                  ),
                });
              }

              let data = setting.data.find((r) => r.label === label);

              setValue(data.value);
              useAdapter.subscribe(() => {
                let data = setting.data.find((r) => r.label === label);
                setValue(data.value);
              });
            }
          }, 0);

          return () => {};
        }, [config, defaultValue, label, type]);

        return value;
      },
    };
  }, [nodeID, onClean, useEditorStore, useStore]);

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
        edgesLength: edges?.length,
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

  let extendAPI = useMemo(() => {
    let eAPI = {
      get boxData() {
        if (mode === "toolbox") {
          let diskSettings = useEditorStore.getState().settings;
          let diskSetting = diskSettings.find((r) => r.nodeID === nodeID);

          diskSetting.metaData = diskSetting.metaData || {};
          return diskSetting.metaData;
        }
        if (mode === "runtime") {
          let runtimeSettings = useStore.getState().settings;
          let runtimeSetting = runtimeSettings.find((r) => r.nodeID === nodeID);

          runtimeSetting.metaData = runtimeSetting.metaData || {};
          return runtimeSetting.metaData;
        }
      },

      tt: 0,
      saveBoxData: () => {
        if (mode === "toolbox") {
          console.log("Saving in Toolbox Runtime");
          let diskSettings = useEditorStore.getState().settings;
          let diskSetting = diskSettings.find((r) => r.nodeID === nodeID);

          clearTimeout(eAPI.tt);
          eAPI.tt = setTimeout(() => {
            useEditorStore.setState({
              settings: diskSettings.map((r) => {
                if (r.nodeID === nodeID) {
                  return diskSetting;
                }
                return r;
              }),
            });
          }, 300);
        }
        if (mode === "runtime") {
          if (process.env.NODE_ENV === "development") {
            console.log("cant saveBoxData in runtime");
          }
        }
      },
    };

    return eAPI;
  }, [mode, nodeID]);

  //
  let setToolboxFullScreen = useCallback(
    (value) => {
      if (mode === "toolbox") {
        let diskSettings = useEditorStore.getState().settings;
        let diskSetting = diskSettings.find((r) => r.nodeID === nodeID);

        diskSetting.enableFullScreen = value;
        extendAPI.saveBoxData();
      }
    },
    [extendAPI, mode, nodeID, useEditorStore]
  );
  //
  return (
    <>
      {io && socketMap && (
        <Algorithm
          //
          setToolboxFullScreen={setToolboxFullScreen}
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
