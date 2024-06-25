import express, { json } from "express";
import { getProjects } from "./getProjects.mjs";
import { recycleProject } from "./recycleProject.mjs";
import { copyProjectTemplate } from "./copyProjectTemplate.mjs";
import { hasOneProject } from "./hasOneProject.mjs";
import { renameProject } from "./renameProject.mjs";

const port = 3456;

const app = express();

app.use(json({ limit: "999GB" }));

app.post("/devapi/project/listAll", async (req, res) => {
  let projects = await getProjects();

  res.json(projects);
});

app.post("/devapi/project/create", async (req, res) => {
  let title = req.body.title;

  await copyProjectTemplate({ title: title });

  res.json({ ok: true });
});

app.post("/devapi/project/recycle", async (req, res) => {
  let title = req.body.title;

  await recycleProject({ title: title });

  res.json({ ok: true });
});

app.post("/devapi/project/hasOne", async (req, res) => {
  let title = req.body.title;

  let result = await hasOneProject({ title: title });

  res.json({ hasOne: result });
});

app.post("/devapi/project/rename", async (req, res) => {
  let title = req.body.title;
  let oldTitle = req.body.oldTitle;

  let result = await renameProject({ oldTitle: oldTitle, title: title });

  res.json({ rename: result });
});

app.listen(port, () => {
  console.log(`Editor app listening on port ${port}`);
});
