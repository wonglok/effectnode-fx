import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FaRegClipboard,
  FaEdit,
  FaTrash,
  FaDownload,
  FaMix,
} from "react-icons/fa";
import { join } from "path";
import { humanReadableByteCount, stripLeadingDirectories } from "./Utils";
import copy from "copy-to-clipboard";

export default function Footer({
  structure,
  setStructure,
  currentPath,
  selection,
  deletePaths,
  reload,
  rename,
  labels,
  enabledFeatures,
  getDownloadLink,
  getFileSizeBytes,
  getFileChangedDate,
  project,
}) {
  const list = structure[currentPath] || [];
  const footerText = getFooterText();

  function getFooterText() {
    const files = list.filter((item) => item.type === 1).length;
    const folders = list.filter((item) => item.type === 2).length;
    const folderLabel =
      folders > 1 ? labels["folderMultiple"] : labels["folderSingle"];
    const fileLabel = files > 1 ? labels["fileMultiple"] : labels["fileSingle"];
    let text = `${folders} ${folderLabel} and ${files} ${fileLabel}`;

    const selectionItem = selection[0];
    if (selectionItem) {
      let selectionBytes;
      if (enabledFeatures.indexOf("getFileSizeBytes") !== -1) {
        selectionBytes = humanReadableByteCount(
          getFileSizeBytes(selectionItem)
        );
      }

      let selectionDate;
      if (enabledFeatures.indexOf("getFileChangedDate") !== -1) {
        selectionDate = new Date(
          getFileChangedDate(selectionItem)
        ).toLocaleString();
      }

      text += ` - ${stripLeadingDirectories(selectionItem)}: `;

      if (selectionBytes) {
        text += `${selectionBytes}`;
      }

      if (selectionDate) {
        if (selectionBytes) {
          text += ", ";
        }
        text += ` ${labels["lastChangedLabel"]} ${selectionDate}`;
      }
    }

    return text;
  }

  const onDeletePath = () => {
    deletePaths(selection)
      .then(() => {
        setStructure({});
        reload();
      })
      .catch((error) => error && console.error(error));
  };

  const onRename = () => {
    rename(selection[0])
      .then(reload)
      .catch((error) => error && console.error(error));
  };

  let selectedName = selection[0];

  // let [assetArray, setAssets] = useState([]);
  //
  //
  //
  //

  // let assetSelected = assetArray.find((r) => r._id.endsWith(selectedName));

  // console.log(selectedName, currentPath, assetArray, assetSelected);

  // console.log(selection);
  // let projectName = project;
  // let onData = useCallback(
  //   async (data) => {
  //     let projectData = data.projects.find(
  //       (r) => r.projectName === projectName
  //     );

  //     if (projectData) {
  //       let assets = projectData.assets || [];
  //       setAssets(assets);
  //     }
  //   },

  //   [projectName]
  // );

  return (
    <div className="FileManager-Footer">
      <div className="Footer-Left flex items-center">
        {selectedName && (
          <button
            className="Icon-Button h-6 w-6 inline-flex items-center justify-center mr-1"
            type="button"
            onClick={() => {
              //
              copy(`files[${JSON.stringify(selectedName)}]`);
            }}
            title={labels["download"]}
          >
            <FaRegClipboard />
          </button>
        )}

        {selectedName && <>{`files[${JSON.stringify(selectedName)}]`}</>}
        {/*  */}
      </div>

      <div className="Footer-Right">
        {selection.length === 1 && enabledFeatures.indexOf("rename") !== -1 && (
          <button
            className="Icon-Button"
            type="button"
            onClick={() => onRename()}
            title={labels["rename"]}
          >
            <FaEdit />
          </button>
        )}
        {!!selection.length &&
          enabledFeatures.indexOf("deletePaths") !== -1 && (
            <button
              className="Icon-Button"
              type="button"
              onClick={() => onDeletePath()}
              title={labels["delete"]}
            >
              <FaTrash />
            </button>
          )}

        {/*  */}
        {/* files["/texture/uv_grid_opengl.jpg"] */}
        {/*  */}

        {!!selection.length &&
          enabledFeatures.indexOf("getDownloadLink") !== -1 && (
            <a
              href={getDownloadLink(selection)}
              download={stripLeadingDirectories(selection[0])}
              className="Icon-Button"
              type="button"
              title={labels["download"]}
            >
              <FaDownload />
            </a>
          )}
      </div>
    </div>
  );
}
