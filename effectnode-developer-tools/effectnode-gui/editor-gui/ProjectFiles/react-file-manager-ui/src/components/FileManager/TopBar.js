import React, { useRef } from "react";
import { FaHome, FaLevelUpAlt, FaSyncAlt, FaUpload, FaFolderPlus } from "react-icons/fa";

export default function TopBar({ currentPath, setCurrentPath, uploadFiles, createDirectory, reload, labels, enabledFeatures }) {

  const uploadInputRef = useRef(null);
  const onFileSelect = (event) => uploadFiles(currentPath, [...event.target.files]).then(reload)
    .catch(error => error && console.error(error));

  const onPathChange = (path) => {
    const newPath = path === '/' ? '' : path;
    if (newPath !== currentPath) {
      setCurrentPath(newPath);
    }
  };

  const onCreateDirectory = () => {
    createDirectory(currentPath).then(reload).catch(error => error && console.error(error));
  };

  return (
    <div className="FileManager-TopBar">
      <div className="TopBar-Left">
        <button className='TopBar-Button Icon-Button' type="button" disabled={!currentPath} onClick={() => setCurrentPath('')}
                title={labels['home']}>
          <FaHome/>
        </button>
        <button className='TopBar-Button Icon-Button' type="button" disabled={!currentPath} title={labels['up']}
                onClick={() => {
                  const parts = currentPath.split('/');
                  parts.splice(parts.length - 1, 1);
                  setCurrentPath(parts.join('/'));
                }}>
          {<FaLevelUpAlt/>}
        </button>
        <button className='TopBar-Button Icon-Button' type="button" title={labels['reload']}
                onClick={() => reload()}>
          {<FaSyncAlt/>}
        </button>
        <input key={currentPath} type="text" defaultValue={currentPath || '/'}
               onBlur={event => onPathChange(event.target.value)}
               onKeyDown={event => {
                 if (event.keyCode === 13) {
                   onPathChange(event.target.value);
                 }
               }}
        />
      </div>
      <div className="TopBar-Right">
        <input
          ref={uploadInputRef}
          type="file"
          onChange={onFileSelect}
          hidden
        />
        {enabledFeatures.indexOf('createDirectory') !== -1 && <button className="TopBar-Button" type="button"
                onClick={() => onCreateDirectory()}>
          {<FaFolderPlus/>} {labels['createDirectory']}
        </button>}
        {enabledFeatures.indexOf('uploadFiles') !== -1 && <button className="TopBar-Button" type="button"
                onClick={() => uploadInputRef.current && uploadInputRef.current.click()}>
          {<FaUpload/>} {labels['upload']}
        </button>}
      </div>
    </div>
  );
}
