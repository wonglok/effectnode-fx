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

import fs from "node:fs";
import { join } from "path";
import mime from "mime";
import unzipper from "unzipper";

// const fs = require("fs");
// const mime = require("mime");
// const unzipper = require("unzipper");

export default class FileService {
  constructor() {}

  list(path) {
    return new Promise((resolve, reject) => {
      fs.access(path, fs.constants.R_OK, (err) => {
        if (err) {
          reject(err);
          return;
        }

        //

        fs.readdir(
          path,
          { encoding: "utf8", withFileTypes: true },
          (err, files) => {
            if (err || files === undefined) {
              reject(err);
              return;
            }

            files = files.filter((r) => {
              return !r.name.includes(".DS_Store");
            });

            resolve(
              files
                .sort((a, b) => {
                  const aName = a.name.toLowerCase();
                  const bName = b.name.toLowerCase();
                  if (aName > bName) {
                    return 1;
                  }
                  if (aName < bName) {
                    return -1;
                  }
                  return 0;
                })
                .map((item) => ({
                  name: item.name,
                  type: item.isDirectory() ? 2 : 1,
                }))
                .sort((a, b) => {
                  if (a.type > b.type) {
                    return -1;
                  }
                  if (a.type < b.type) {
                    return 1;
                  }
                  return 0;
                })
            );
          }
        );
      });
    });
  }

  get(path) {
    return new Promise((resolve, reject) => {
      fs.access(path, (err) => {
        if (err) {
          reject(err);
          return;
        }
        fs.readFile(path, { encoding: "utf8" }, (err, data) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(data);
        });
      });
    });
  }

  pipe(path, res) {
    return new Promise((resolve, reject) => {
      fs.access(path, (err) => {
        if (err) {
          reject(err);
          return;
        }

        const stats = fs.statSync(path);
        const readStream = fs.createReadStream(path);
        res.setHeader("Content-Type", mime.getType(path));
        res.setHeader("Content-Type", stats.size);
        readStream.pipe(res);
      });
    });
  }

  put(path, data) {
    return new Promise((resolve, reject) => {
      fs.access(path, (err) => {
        if (err) {
          reject(err);
          return;
        }
        fs.writeFile(
          path,
          data,
          { encoding: "utf8", flag: "w+" },
          (err, data) => {
            if (err) {
              reject(err);
              return;
            }
            resolve();
          }
        );
      });
    });
  }

  upload(path, files) {
    return new Promise((resolve, reject) => {
      fs.access(path, (err) => {
        if (err) {
          reject(err);
          return;
        }
        files.forEach((item) => {
          item.mv(join(path, item.name));
        });
        resolve();
      });
    });
  }

  extract(path) {
    return new Promise((resolve, reject) => {
      fs.access(path, (err) => {
        if (err) {
          reject(err);
          return;
        }
        const tmp = path.split(".");
        if (tmp.length > 1) {
          tmp.splice(tmp.length - 1, 1);
        }
        try {
          fs.createReadStream(path).pipe(
            unzipper.Extract({ path: tmp.join(".") })
          );
        } catch (err) {
          reject(err);
          return;
        }
        resolve();
      });
    });
  }

  deleteFolderRecursive(path) {
    if (fs.existsSync(path)) {
      if (fs.lstatSync(path).isDirectory()) {
        fs.readdirSync(path).forEach((file) => {
          const curPath = join(path, file);
          this.deleteFolderRecursive(curPath);
        });
        fs.rmdirSync(path);
      } else {
        fs.unlinkSync(path);
      }
    }
  }

  delete(path) {
    return new Promise((resolve, reject) => {
      fs.access(path, (err) => {
        if (err) {
          reject(err);
          return;
        }
        fs.unlink(path, (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });
    });
  }

  createDir(path, name) {
    return new Promise((resolve, reject) => {
      fs.access(path, (err) => {
        if (err) {
          reject(err);
          return;
        }
        fs.mkdir(join(path, name), (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });
    });
  }

  rename(path, name) {
    return new Promise((resolve, reject) => {
      fs.access(path, (err) => {
        if (err) {
          reject(err);
          return;
        }
        const parts = path.split("/");
        parts.splice(parts.length - 1, 1);
        const newPath = join(parts.join("/"), name); // + "/" + name;
        fs.rename(path, newPath, (err) => {
          if (err) {
            reject(err);
            return;
          }
          resolve();
        });
      });
    });
  }
}
