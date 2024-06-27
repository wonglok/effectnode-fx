import { useCallback, useEffect, useMemo, useState } from "react";
import { Clock } from "three";

export function CodeRun({
  useStore,
  Algorithm = () => null,
  codeName,
  domElement,
}) {
  let settings = useStore((r) => r.settings) || [];
  let graph = useStore((r) => r.graph) || {};
  let nodes = graph.nodes || [];
  let nodeOne = nodes.find((r) => r.title === codeName);
  let setting = settings.find((r) => r.nodeID === nodeOne?._id);

  let ui = useMemo(() => {
    return {};
  }, []);

  if (setting && setting?.data) {
    for (let userInput of setting.data) {
      ui[userInput.label] = userInput.value;
    }
  }

  let [loop] = useState([]);
  useEffect(() => {
    let c = new Clock();
    let tt = 0;
    let rAF = () => {
      tt = requestAnimationFrame(rAF);
      let dt = c.getDelta();
      loop.forEach((r) => r({}, dt));
    };
    tt = requestAnimationFrame(rAF);
    return () => {
      cancelAnimationFrame(tt);
    };
  }, [loop]);

  let onLoop = useCallback(
    (v) => {
      loop.push(v);

      return () => {
        let idx = loop.findIndex((l) => l === v);
        loop.splice(idx, 1);
      };
    },
    [loop]
  );

  let [io, setIO] = useState(false);
  useEffect(() => {
    //

    //
    let cleans = [];
    let ioPXY = new Proxy(
      {
        //
      },
      {
        get: (obj, key) => {
          if (key.startsWith("out")) {
            let idx = Number(key.replace("out", ""));

            let node = nodeOne;
            let output = node.outputs[idx];

            return (val) => {
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
              //
            };
          }

          if (key.startsWith("res")) {
            let idx = Number(key.replace("res", ""));

            let node = nodeOne;
            let socket = node.outputs[idx];

            return (handler) => {
              //
              let hh = ({ detail }) => {
                handler(detail);
              };
              domElement.addEventListener(socket._id, hh);

              cleans.push(() => {
                domElement.removeEventListener(socket._id, hh);
              });

              return () => {
                domElement.removeEventListener(socket._id, hh);
              };
              //
            };
          }

          if (key.startsWith("in")) {
            let idx = Number(key.replace("in", ""));

            let node = nodeOne;
            let input = node.inputs[idx];

            return (handler) => {
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

    return () => {
      cleans.forEach((it) => {
        it();
      });
    };
  }, [domElement, nodeOne, useStore]);

  return (
    <>
      {io && (
        <Algorithm
          //
          onLoop={onLoop}
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
