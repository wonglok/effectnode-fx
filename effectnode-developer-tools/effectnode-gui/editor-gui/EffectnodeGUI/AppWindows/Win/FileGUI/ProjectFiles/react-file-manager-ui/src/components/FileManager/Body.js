import React, { useEffect, useCallback, useRef } from "react";
import { FaRegFile, FaRegFolder } from "react-icons/fa";
import { useDropzone } from "react-dropzone";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCloudArrowUp, faUpload } from "@fortawesome/free-solid-svg-icons";

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
        {/* !!list<div className={`w-full h-24 border p-3 cursor-pointer `}>
          <div className="flex items-center justify-center border border-dashed rounded-lg h-full w-full">
            {isDragActive ? (
              <p>{`Drop the files here ...`}</p>
            ) : (
              <p>{`Drag 'n' drop some files here, or click to select files`}</p>
            )}
          </div>
        </div>
         */}

        <div
          className={"FileManager-Body cursor-pointer"}
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            setSelection([]);
          }}
          {...getRootProps()}
        >
          <input {...getInputProps()} />
          {!isDragActive && (
            <>
              <div className="w-full h-full hover:bg-gray-200 bg-gray-300 flex items-center justify-center">
                Upload
                <FontAwesomeIcon className="mx-2" icon={faCloudArrowUp} />
              </div>
            </>
          )}
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
                    <div className="Body-Item-Icon">
                      {item.type === 1 ? (
                        <Thumb project={project} path={path}></Thumb>
                      ) : (
                        <FaRegFolder />
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
      <div className="w-full h-full bg-gray-500 rounded-xl">
        <img src={`${basePath}`} className="w-full h-full object-contain"></img>
      </div>
    </>
  );
}
