import { getID } from "./getID";

export function makeGraphNode({ spaceID }) {
  let nodeID = getID();
  return {
    //
    spaceID: spaceID,
    _id: nodeID,

    //
    title: "node",

    position: [0, 0, 0],

    //
    inputs: [
      {
        _id: getID(),
        type: "input",
        nodeID: nodeID,
        label: "",
      },
      {
        _id: getID(),
        type: "input",
        nodeID: nodeID,
        label: "",
      },
      {
        _id: getID(),
        type: "input",
        nodeID: nodeID,
        label: "",
      },
      {
        _id: getID(),
        type: "input",
        nodeID: nodeID,
        label: "",
      },
      {
        _id: getID(),
        type: "input",
        nodeID: nodeID,
        label: "",
      },
    ],

    outputs: [
      {
        _id: getID(),
        type: "output",
        nodeID: nodeID,
        label: "",
      },
      {
        _id: getID(),
        type: "output",
        nodeID: nodeID,
        label: "",
      },
      {
        _id: getID(),
        type: "output",
        nodeID: nodeID,
        label: "",
      },
      {
        _id: getID(),
        type: "output",
        nodeID: nodeID,
        label: "",
      },
      {
        _id: getID(),
        type: "output",
        nodeID: nodeID,
        label: "",
      },
    ],

    //
  };
}

export function makeCode({ nodeID, spaceID, nodeTitle }) {
  let codeID = getID();
  return {
    codeID,
    //
    nodeID: nodeID,
    nodeTitle: nodeTitle,
    spaceID: spaceID,
    code: "",
    data: [
      {
        _id: getID(),
        label: "speed",
        type: "range",
        min: 0,
        max: 1,
        step: 0.01,
        value: 0,
      },
      {
        _id: getID(),
        label: "baseColor",
        type: "color",
        value: "#ff0000",
      },
      {
        _id: getID(),
        label: "name",
        type: "text",
        value: "hi dear",
      },
    ],
  };
}

export function makeGraphEdge({ spaceID }) {
  return {};
}
