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
import React from "react";
import FileManager from "./react-file-manager-ui/src/components/FileManager/FileManager";

const getAPIS = ({ projectName }) => {
  const apiPath = "/devapi/fs";
  const projectURI = `${encodeURIComponent(projectName)}`;
  const core = {};
  core.getList = (path = "/") => {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch(
          apiPath + "/file/list?project=" + projectURI + "&path=" + path
        );
        const list = await response.json();
        resolve(list);
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  };

  core.createDirectory = (path) => {
    return new Promise(async (resolve, reject) => {
      const name = prompt("Directory name", "New folder");
      if (name) {
        try {
          await fetch(apiPath + "/file/mkdir?project=" + projectURI + "", {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path, name }),
          });
          resolve();
        } catch (error) {
          console.error(error);
          reject(error);
        }
      } else {
        reject();
      }
    });
  };

  core.deletePaths = (paths) => {
    return new Promise(async (resolve, reject) => {
      if (window.confirm("Delete ?")) {
        try {
          await fetch(apiPath + "/file/delete?project=" + projectURI + "", {
            method: "delete",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ paths }),
          });
          resolve();
        } catch (error) {
          console.error(error);
          reject(error);
        }
      } else {
        reject();
      }
    });
  };

  core.openFile = (path) => {
    window.open(apiPath + "/file/pipe" + path + "?project=" + projectURI + "");
  };

  core.rename = (path) => {
    return new Promise(async (resolve, reject) => {
      const parts = path.split("/");
      const name = prompt("New name", parts[parts.length - 1]);
      if (name) {
        try {
          await fetch(apiPath + "/file/rename?project=" + projectURI + "", {
            method: "post",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path, name }),
          });
          resolve();
        } catch (error) {
          console.error(error);
          reject(error);
        }
      } else {
        reject();
      }
    });
  };

  core.uploadFiles = (path, files) => {
    return new Promise(async (resolve, reject) => {
      console.log({ path, files });
      try {
        const formData = new FormData();
        [...files].forEach((file, index) => {
          formData.append("file" + index, file);
        });
        formData.append("path", path);
        await fetch(apiPath + "/file/upload" + "?project=" + projectURI + "", {
          method: "post",
          body: formData,
        });
        resolve();
      } catch (error) {
        console.error(error);
        reject(error);
      }
    });
  };

  core.getDownloadLink = (path) => {
    let link = apiPath + "/file/pipe" + path + "?project=" + projectURI + "";
    return link;
  };
  return core;
};

//

export function ProjectFiles({ projectName = "lok" }) {
  let core = getAPIS({ projectName: projectName });
  return (
    <div className="w-full h-full">
      <FileManager
        project={projectName}
        height={"100%"}
        getList={core.getList}
        createDirectory={core.createDirectory}
        deletePaths={core.deletePaths}
        openFile={core.openFile}
        uploadFiles={core.uploadFiles}
        rename={core.rename}
        getDownloadLink={core.getDownloadLink}
        features={[
          "createDirectory",
          "getDownloadLink",
          "uploadFiles",
          "deletePaths",
          "rename",
        ]}
      />
    </div>
  );
}
