import express, { json } from "express";
import { getProjects } from "./getProjects.mjs";
import { copyProjectTemplate } from "./copyProjectTemplate.mjs";
import { renameProject } from "./renameProject.mjs";
// import { getPJNodes, setPJNodes } from "./getPJNodes.mjs";
import { getPJGraph, setPJGraph } from "./getPJGraph.mjs";
import { removeProject } from "./removeProject.mjs";
import { cloneProject } from "./cloneProject.mjs";
import { openEditorCoder } from "./openEditorCoder.mjs";
import { getProjectGraphs } from "./getProjectGraphs.mjs";
import fileUpload from "express-fileupload";
import cors from "cors";
import bodyParser from "body-parser";
import FileController from "./api/controllers/FileController.mjs";
// import { OllamaController } from "./ollama/OllamaController.mjs";

const port = 3456;

const app = express();

app.set("etag", false);
app.use((req, res, next) => {
  res.set("Cache-Control", "no-store");
  next();
});

app.use(cors());
app.use(express.json({ limit: "1TB" }));
app.use(
  fileUpload({
    createParentPath: true,
  })
);
app.use(bodyParser.urlencoded({ extended: false, limit: "100mb" }));
app.use(bodyParser.json({ type: "application/*+json", limit: "100mb" }));
app.use(bodyParser.text({ type: "text/html", limit: "100mb" }));

new FileController(app, { path: "" });

// new OllamaController({ app });

// app.use(json({ limit: "999GB" }));

app.post("/devapi/project/listAllGraph", async (req, res) => {
  let title = req.body.title;

  let projects = await getProjectGraphs({ title });

  res.json(projects);
});

app.post("/devapi/project/listAll", async (req, res) => {
  let title = req.body.title;

  let projects = await getProjects({ title });

  res.json(projects);
});

app.post("/devapi/project/editor", async (req, res) => {
  let title = req.body.title;
  let nodeTitle = req.body.nodeTitle;

  await openEditorCoder({ title, nodeTitle });

  res.json({ ok: true });
});

app.post("/devapi/project/create", async (req, res) => {
  let title = req.body.title;

  let projects = await getProjects({ title });
  let result = projects.some((r) => r.title === title);
  if (!result) {
    await copyProjectTemplate({ title: title });
    res.json({ ok: true });
  } else {
    res.status(406).json({ errorMsg: "name-taken" });
  }
});

app.post("/devapi/project/recycle", async (req, res) => {
  let title = req.body.title;

  if (!title) {
    res.status(500).json({ error: true });
    return;
  }

  await removeProject({
    oldTitle: title,
    title: `${new Date().getTime()}-${title}`,
  });

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
  let oldTitle = req.body.oldTitle;
  let title = req.body.title;

  let projects = await getProjects({ title });
  let repeated = projects.some((r) => r.title === title);
  if (repeated) {
    res.status(406).json({ errorMsg: "name-taken" });
    return;
  }

  if (oldTitle === title) {
    return res.json({ rename: {} });
  }

  let result = await renameProject({ oldTitle: oldTitle, title: title });

  res.json({ rename: result });
});

app.post("/devapi/project/clone", async (req, res) => {
  let title = req.body.title;
  let oldTitle = req.body.oldTitle;

  let projects = await getProjects({ title });
  let repeated = projects.some((r) => r.title === title);

  if (repeated) {
    return res.status(406).json({ errorMsg: "nane-taken" });
  }

  let result = await cloneProject({ oldTitle: oldTitle, title: title });

  res.json({ clone: result });
});

app.post("/devapi/graph/getProjectGraph", async (req, res) => {
  //
  try {
    let title = req.body.title;

    let json = await getPJGraph({
      title,
    });
    json.title = title;

    res.json(json);
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
  let json = req.body.json || {};

  await setPJGraph({
    //
    title,
    json: {
      ...json,
      title,
    },
  });

  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`Editor app listening on port ${port}`);
});

//
//
//
