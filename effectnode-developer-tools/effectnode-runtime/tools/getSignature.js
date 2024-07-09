export let getSignature = async (projects) => {
  let text = "";
  for (let projectRaw of projects) {
    let project = JSON.parse(JSON.stringify(projectRaw));

    text += JSON.stringify({
      _id: project._id,
      projectName: project.projectName,
      codes: project.codes,
      graph: {
        nodes: project.graph.nodes.map((r) => {
          r.position = [0, 0, 0];
          return r;
        }),
        edges: project.graph.edges,
      },
      settings: project.settings.map((r) => {
        if (window.location.href.includes("localhost")) {
          r.data = r.data.map((da) => {
            da.value = null;
            return da;
          });
        }
        return r;
      }),
    });
  }

  return { text };
};
