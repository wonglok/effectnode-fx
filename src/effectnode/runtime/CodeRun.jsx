import md5 from "md5";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Clock } from "three";
import { getID } from "./tools/getID";

export function CodeRun({
  useStore,
  Algorithm = () => null,
  codeName,
  domElement,
  win = false,
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

  let [{ onLoop }, setAPI] = useState({
    onLoop: () => {},
  });
  useEffect(() => {
    let api = {
      tsk: [],
      onLoop: (v) => {
        api.tsk.push(v);
      },
      workAll: () => {},
    };

    setAPI(api);

    let rAFID = 0;
    let rAF = () => {
      rAFID = requestAnimationFrame(rAF);
      api.tsk.forEach((t) => t());
    };
    rAFID = requestAnimationFrame(rAF);

    return () => {
      cancelAnimationFrame(rAFID);
    };
  }, []);

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

    let onHoldData = new Map();
    let handlersMap = new Map();
    let readyMap = new Map();

    nodeOne.outputs.map((socket) => {
      readyMap.set(socket._id, false);
      handlersMap.set(socket._id, []);
      onHoldData.set(socket._id, []);
    });

    nodeOne.outputs.map((socket) => {
      let hhh = async ({ detail }) => {
        let onHoldDataArray = onHoldData.get(socket._id);
        let handlerArray = handlersMap.get(socket._id);

        let isSetup = readyMap.get(socket._id);

        if (!isSetup) {
          onHoldDataArray.push(detail);
        } else {
          handlerArray.forEach(async (handler) => {
            let response = await handler(detail.requestData);
            detail.collectResponse(response);
          });
        }

        // if (handlerArray.length === 0) {
        //   onHoldData.push(detail);
        // } else {
        //   onHoldData.push(detail);

        //   for (let detail of onHoldData) {
        //     for (let handler of handlerArray.values()) {
        //       let response = await handler(detail.requestData);
        //       detail.collectResponse(response);
        //     }
        //   }

        //   onHoldData.set(socket._id, []);
        // }
      };

      cleans.push(() => {
        domElement.removeEventListener(socket._id + "serve", hhh);
      });

      domElement.addEventListener(socket._id + "serve", hhh);
    });

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
                domElement.dispatchEvent(
                  new CustomEvent(edge.input._id, {
                    detail: val,
                  })
                );
              });

              //
            };
          }

          if (key.startsWith("res")) {
            return (idx, handler) => {
              let setup = (idx) => {
                let socket = nodeOne.outputs[idx];

                readyMap.set(socket._id, true);
                let handlerArray = handlersMap.get(socket._id);
                let onHoldDataArray = onHoldData.get(socket._id);

                handlerArray.push(handler);

                onHoldDataArray.forEach((detail) => {
                  //
                  //
                  handlerArray.forEach(async (handler) => {
                    let response = await handler(detail.requestData);
                    detail.collectResponse(response);
                  });

                  //
                });

                for (let i = 0; i < onHoldDataArray.length; i++) {
                  onHoldDataArray.splice(i, 1);
                }

                readyMap.set(socket._id, true);
                //
              };
              if (idx === "*" || idx === "all") {
                for (let idxLocal in nodeOne.outputs) {
                  setup(idxLocal);
                }
              } else {
                setup(idx);
              }
            };
          }

          if (key.startsWith("req")) {
            return async (idx, data) => {
              // let idx = Number(key.replace("request", ""));

              let node = nodeOne;

              let socket = node.inputs[idx];

              let edges = useStore?.getState()?.graph?.edges || [];

              let destEdges = edges.filter((r) => r.input._id === socket._id);

              return new Promise((resolve) => {
                destEdges.forEach((edge) => {
                  ///
                  domElement.dispatchEvent(
                    new CustomEvent(edge.output._id + "serve", {
                      detail: {
                        requestData: data,
                        collectResponse: (v) => {
                          resolve(v);
                        },
                      },
                    })
                  );
                });
              });
            };
          }

          if (key.startsWith("in")) {
            return (idx, handler) => {
              // let idx = Number(key.replace("in", ""));

              let node = nodeOne;
              let input = node.inputs[idx];

              //
              let hh = ({ detail }) => {
                handler(detail);
              };
              domElement.addEventListener(input._id, hh);

              cleans.push(() => {
                domElement.removeEventListener(input._id, hh);
              });

              return () => {
                domElement.removeEventListener(input._id, hh);
              };
              //
            };
          }
        },
        //
        //
      }
    );

    setIO(ioPXY);

    return () => {};
  }, [domElement, nodeOne, useStore]);

  return (
    <>
      {io && (
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
