import md5 from "md5";
import { useEffect, useMemo, useState } from "react";
import { getID } from "./tools/getID";

export function CodeRun({
  useStore,
  Algorithm = () => null,
  codeName,
  domElement,
  win = false,
  socketMap,
  onLoop,
}) {
  let settings = useStore((r) => r.settings);
  let graph = useStore((r) => r.graph) || {};
  let nodes = graph.nodes || [];
  let nodeOne = nodes.find((r) => r.title === codeName);
  let setting = settings.find((r) => r.nodeID === nodeOne?._id);

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
      provide: ({
        label = "objectName",
        type = "text",
        defaultValue,
        ...config
      }) => {
        //
        if (!["text", "range", "color", "number"].includes(type)) {
          throw new Error("not supported type: " + type);
        }
        if (type === "number") {
          type = "range";
        }

        let settings = useStore.getState().settings;
        let setting = settings.find((r) => r.nodeID === nodeOne?._id);
        // setting.data
        if (!setting.data.some((r) => r.label === label)) {
          let entry = {
            _id: `${md5(getID())}`,
            label: `${label}`,
            type: `${type}`,
            value: defaultValue,
            ...config,
          };
          setting.data.push(entry);
        }

        let data = setting.data.find((r) => r.label === label);
        let output = {
          value: data.value,
          onChange: (fnc) => {
            return useStore.subscribe(() => {
              let data = setting.data.find((r) => r.label === label);
              output.value = data.value;
              fnc(data.value);
            });
          },
        };

        useStore.subscribe(() => {
          let data = setting.data.find((r) => r.label === label);
          output.value = data.value;
        });

        setTimeout(() => {
          useStore.setState({
            settings: JSON.parse(JSON.stringify(useStore.getState().settings)),
          });
        });

        return output;
      },
    };
  }, [nodeOne?._id, useStore]);

  if (setting && setting?.data) {
    for (let userInput of setting.data) {
      ui[userInput.label] = userInput.value;
    }
  }

  let [io, setIO] = useState(false);

  //
  useEffect(() => {
    let cleans = [];

    let ioPXY = new Proxy(
      {
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
            return (idx, handler) => {
              return new Promise((resolve) => {
                //
                // let idx = Number(key.replace("in", ""));
                //

                let node = nodeOne;
                let input = node.inputs[idx];

                let clean = socketMap.subscribe((state, before) => {
                  if (typeof state[input._id] !== "undefined") {
                    handler(state[input._id]);
                  }
                });

                let tt = setInterval(() => {
                  let val = socketMap.getState()[input._id];
                  if (typeof val !== "undefined") {
                    handler(val);
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
  }, [domElement, nodeOne, socketMap, useStore]);

  return (
    <>
      {io && socketMap && (
        <Algorithm
          //
          win={win}
          onLoop={onLoop}
          onClean={onClean}
          useStore={useStore}
          domElement={domElement}
          ui={ui}
          io={io}
          //
        ></Algorithm>
      )}
    </>
  );
}
