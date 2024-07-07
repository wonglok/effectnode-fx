export let getSignature = async (projects) => {
  let text = "";
  let codeSet = new Set();
  for (let projectRaw of projects) {
    let project = JSON.parse(JSON.stringify(projectRaw));

    for (let code of projectRaw.codes) {
      if (codeSet.has(code.loadCode)) {
        console.log("repated");
      } else {
        codeSet.add(code.loadCode);
      }
    }

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
        r.data = r.data.map((da) => {
          da.value = null;
          return da;
        });
        return r;
      }),
      // signature: project.signature,
    });
  }

  return { text, codeSet };
};
