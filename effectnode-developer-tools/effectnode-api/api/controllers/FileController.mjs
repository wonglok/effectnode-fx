/** @license MIT
 * MIT License

Copyright (c) 2021 ghzcool

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

MIT License

Copyright (c) 2024 wong lok

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

 */

// const FileService = require("../services/FileService");
import FileService from "../services/FileService.mjs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectAll = `${join(__dirname, "../../../../", "src/effectnode/projects")}`;
export default class FileController {
  constructor(app, { path }) {
    this.fileService = new FileService();
    app.get("/devapi/fs/file/list", (req, res) => this.listGet(req, res));
    app.get("/devapi/fs/file/pipe/*", (req, res) => this.contentPipe(req, res));
    app.put("/devapi/fs/file/put", (req, res) => this.contentPut(req, res));
    app.delete("/devapi/fs/file/delete", (req, res) => this.delete(req, res));
    app.post("/devapi/fs/file/mkdir", (req, res) => this.createDir(req, res));
    app.post("/devapi/fs/file/rename", (req, res) => this.rename(req, res));
    app.post("/devapi/fs/file/upload", (req, res) => this.upload(req, res));
    app.get("/devapi/fs/file/extract", (req, res) => this.extract(req, res));

    console.log("FilesController registered");
  }

  getPath(baseURL, path = "/") {
    // return baseURL + (path || "") + (path !== "/" ? "/" : "");
    return join(baseURL, path);
  }

  getProjectBaseURL(req) {
    return join(projectAll, `${req.query.project}/assets/`);
  }

  listGet(req, res) {
    res.setHeader("Content-Type", "application/json-patch+json");

    const baseURL = this.getProjectBaseURL(req);
    try {
      fs.accessSync(baseURL, fs.constants.R);
    } catch (e) {
      // console.log(e);
      fs.mkdirSync(baseURL, { recursive: true });
    }

    const { query } = req;

    const path = join(baseURL, query.path || "");

    this.fileService
      .list(path)
      .then((response) => res.send(response))
      .catch((error) => {
        console.error(error);
        res.status(500).send(error);
      });
  }

  contentPipe(req, res) {
    const { params } = req;
    const baseURL = this.getProjectBaseURL(req);
    const path = baseURL + "/" + (params[0] || "");
    try {
      this.fileService
        .pipe(path, res)
        .then()
        .catch((error) => {
          console.error(error);
          res.status(500).end();
        });
    } catch (error) {
      console.error(error);

      res.status(500).end();
    }
  }

  upload(req, res) {
    const { body, files } = req;
    const baseURL = this.getProjectBaseURL(req);
    const path = this.getPath(baseURL, body.path);
    if (!files) {
      res.status(500).end();
    }
    this.fileService
      .upload(
        path,
        Object.keys(files).map((key) => files[key])
      )
      .then(() => res.end())
      .catch((error) => {
        console.error(error);
        res.status(500).end();
      });
  }

  contentPut(req, res) {
    const { body } = req;
    const baseURL = this.getProjectBaseURL(req);
    const path = this.getPath(baseURL, body.path);

    this.fileService
      .put(path, body)
      .then(() => res.end())
      .catch((error) => {
        console.error(error);
        res.status(500).end();
      });
  }

  delete(req, res) {
    const { body } = req;
    const baseURL = this.getProjectBaseURL(req);
    const paths = [...body.paths].map((path) => this.getPath(baseURL, path));

    Promise.all(
      [...paths].map((path) => this.fileService.deleteFolderRecursive(path))
    )
      .then(() => res.end())
      .catch((error) => {
        console.error(error);
        res.status(500).end();
      });
  }

  extract(req, res) {
    const { query } = req;
    const baseURL = this.getProjectBaseURL(req);
    const path = this.getPath(baseURL, query.path);

    this.fileService
      .extract(path)
      .then(() => res.end())
      .catch((error) => {
        console.error(error);
        res.status(500).end();
      });
  }

  createDir(req, res) {
    const { body } = req;
    const baseURL = this.getProjectBaseURL(req);
    const path = this.getPath(baseURL, body.path);
    const { name } = body;

    this.fileService
      .createDir(path, name)
      .then(() => res.end())
      .catch((error) => {
        console.error(error);
        res.status(500).end();
      });
  }

  rename(req, res) {
    const { body } = req;
    const baseURL = this.getProjectBaseURL(req);
    const path = `${baseURL}/${body.path || ""}`;

    // const path = this.getPath(baseURL, body.path || "");
    const { name } = body;

    this.fileService
      .rename(path, name)
      .then(() => res.end())
      .catch((error) => {
        console.error(error);
        res.status(500).end();
      });
  }
}
