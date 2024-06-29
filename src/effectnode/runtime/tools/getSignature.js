export let getSignature = (list) =>
  JSON.stringify(
    list.map((gra) => {
      //   console.log(gra);
      return {
        _id: gra._id,
        projectName: gra.projectName,
        codes: gra.codes,
        graph: {
          nodes: gra.graph.nodes.map((r) => {
            delete r.position;
            return r;
          }),
          edges: gra.graph.edges,
        },
        settings: gra.settings.map((r) => {
          //   console.log(r.data);
          r.data = r.data.map((da) => {
            delete da.value;
            return da;
          });
          return r;
        }),
      };
    })
  );
