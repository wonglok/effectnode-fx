import React, { useEffect, useCallback, useRef } from "react";
import { FaRegFile, FaRegFolder } from "react-icons/fa";
import { useDropzone } from "react-dropzone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCloudArrowUp,
  faFolder,
  faUpload,
} from "@fortawesome/free-solid-svg-icons";

export default function Body({
  structure,
  reload,
  currentPath,
  setCurrentPath,
  openFile,
  selection,
  setSelection,
  rename,
  enabledFeatures,
  uploadFiles,
  project,
}) {
  const list = structure[currentPath] || [];

  const onDrop = useCallback(
    async (acceptedFiles) => {
      // Do something with the files

      uploadFiles(currentPath, acceptedFiles)
        .then(reload)
        .catch((error) => error && console.error(error));

      //
    },
    [currentPath, reload, uploadFiles]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const onRename = () => {
    rename(selection[0])
      .then(reload)
      .catch((error) => error && console.error(error));
  };

  return (
    <div className="w-full h-full">
      <div className="w-full h-full">
        <div
          className={"FileManager-Body "}
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            setSelection([]);
          }}
        >
          <input {...getInputProps()} />

          <div className="Body-Item">
            <div className="Body-Item-Icon cursor-pointer">
              <div
                {...getRootProps()}
                className="hover:bg-gray-200 bg-gray-200 p-2 w-full h-full rounded-lg flex items-center justify-center"
              >
                <FontAwesomeIcon className="text-2xl" icon={faCloudArrowUp} />
              </div>
            </div>
            <div className="Body-Item-Name">Upload Files</div>
          </div>

          {!!list && (
            <>
              {list.map((item, index) => {
                const path = currentPath + "/" + item.name;
                const selected = selection.indexOf(path) !== -1;
                return (
                  <div
                    key={index}
                    className={"Body-Item" + (selected ? " Item-Selected" : "")}
                    onClick={(event) => {
                      event.stopPropagation();
                      event.preventDefault();
                      setSelection([path]);
                    }}
                    onDoubleClick={(event) => {
                      event.stopPropagation();
                      event.preventDefault();
                      setSelection([]);
                      if (item.type === 1) {
                        openFile(path);
                      } else {
                        setCurrentPath(path);
                      }
                    }}
                  >
                    <div className="Body-Item-Icon cursor-pointer">
                      {item.type === 1 ? (
                        <Thumb project={project} path={path}></Thumb>
                      ) : (
                        <FontAwesomeIcon className="text2-xl" icon={faFolder} />
                      )}
                    </div>
                    <div
                      className="Body-Item-Name"
                      title={item.name}
                      onClick={() => {
                        const range = window.getSelection();
                        if (
                          selection[0] === path &&
                          enabledFeatures.indexOf("rename") !== -1 &&
                          !range.toString().length
                        ) {
                          onRename();
                        }
                      }}
                    >
                      {item.name}
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Thumb({ path, project }) {
  //

  let basePath = `/devapi/fs/file/pipe${path}?project=${project}`;

  return (
    <>
      <div className="w-full h-full bg-gray-200 p-2 rounded-xl">
        {(basePath.includes(".png") || basePath.includes(".jpg")) && (
          <img
            src={`${basePath}`}
            className="w-full h-full object-contain"
          ></img>
        )}
      </div>
    </>
  );
}
