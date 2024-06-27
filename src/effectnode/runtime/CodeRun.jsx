import { useMemo } from "react";

export function CodeRun({
  useStore,
  Algorithm = () => null,
  codeName,
  domElement,
}) {
  let settings = useStore((r) => r.settings) || [];
  let graph = useStore((r) => r.graph) || {};
  let nodes = graph.nodes || [];
  let nodeOne = nodes.find((r) => r.title === codeName) || {};
  let setting = settings.find((r) => r.nodeID === nodeOne?._id);

  let ui = useMemo(() => {
    return {};
  }, []);

  if (setting && setting?.data) {
    for (let userInput of setting.data) {
      ui[userInput.label] = userInput.value;
    }
  }

  return (
    <Algorithm
      //
      useStore={useStore}
      domElement={domElement}
      ui={ui}
      //
    ></Algorithm>
  );
}
