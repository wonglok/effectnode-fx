export let getSignature = (list) => {
  let yo = JSON.stringify(
    list.map((gra) => {
      gra = JSON.parse(JSON.stringify(gra));

      return {
        _id: gra._id,
        projectName: gra.projectName,
        // codes: gra.codes,
        graph: {
          nodes: gra.graph.nodes.map((r) => {
            r.position = [0, 0, 0];
            return r;
          }),
          edges: gra.graph.edges,
        },
        settings: gra.settings.map((r) => {
          r.data = r.data.map((da) => {
            da.value = null;
            return da;
          });
          return r;
        }),
      };
    })
  );

  return yo;
};
