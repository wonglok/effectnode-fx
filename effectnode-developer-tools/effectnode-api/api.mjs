import express, { json } from "express";
import { getProjects } from "./getProjects.mjs";
import { copyProjectTemplate } from "./copyProjectTemplate.mjs";
import { renameProject } from "./renameProject.mjs";
import { getPJNodes, setPJNodes } from "./getPJNodes.mjs";
import { getPJGraph, setPJGraph } from "./getPJGraph.mjs";
import { removeProject } from "./removeProject.mjs";

const port = 3456;

const app = express();

app.use(json({ limit: "999GB" }));

app.post("/devapi/project/listAll", async (req, res) => {
  let title = req.body.title;

  let projects = await getProjects({ title });

  res.json(projects);
});

app.post("/devapi/project/create", async (req, res) => {
  let title = req.body.title;

  await copyProjectTemplate({ title: title });

  res.json({ ok: true });
});

app.post("/devapi/project/recycle", async (req, res) => {
  let title = req.body.title;

  if (!title) {
    res.status(500).json({ error: true });
    return;
  }

  await removeProject({ title: title });

  res.json({ ok: true });
});

app.post("/devapi/project/hasOne", async (req, res) => {
  let title = req.body.title;
  if (!title) {
    return { hasOne: false };
  }

  let projects = await getProjects({ title });

  let result = projects.some((r) => r.title === title);

  res.json({ hasOne: result });
});

app.post("/devapi/project/rename", async (req, res) => {
  let title = req.body.title;
  let oldTitle = req.body.oldTitle;

  let result = await renameProject({ oldTitle: oldTitle, title: title });

  res.json({ rename: result });
});

app.post("/devapi/graph/getProjectGraph", async (req, res) => {
  //
  try {
    let title = req.body.title;

    let graph = await getPJGraph({
      //
      title,
      //
    });

    let nodes = await getPJNodes({
      //
      title,
      //
    });

    graph.nodes = nodes;

    res.json(graph);
  } catch (r) {
    console.log(r);
    res.status(500).json({
      failed: "error",
    });
  }
  //
});

app.post("/devapi/graph/setProjectGraph", async (req, res) => {
  //
  let title = req.body.title;
  let graph = req.body.graph;
  let nodes = graph.nodes;
  let edges = graph.edges;

  let graphResult = await setPJGraph({
    //
    title,
    edges: edges,
    //
  });

  let nodesResult = await setPJNodes({
    //
    title,
    nodes: nodes,
    //
  });

  res.json(graph);
  //
});

app.listen(port, () => {
  console.log(`Editor app listening on port ${port}`);
});
