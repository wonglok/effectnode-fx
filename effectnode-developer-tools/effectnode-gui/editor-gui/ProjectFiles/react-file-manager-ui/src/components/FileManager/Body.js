import React from "react";
import { FaRegFile, FaRegFolder } from "react-icons/fa";

export default function Body({ structure, reload, currentPath, setCurrentPath, openFile, selection, setSelection, rename, enabledFeatures }) {
  const list = structure[currentPath] || [];

  const onRename = () => {
    rename(selection[0]).then(reload).catch(error => error && console.error(error));
  };

  return (
    <div className={'FileManager-Body'} onClick={event => {
      event.stopPropagation();
      event.preventDefault();
      setSelection([]);
    }}>
      {!!list && <>
        {list.map((item, index) => {
          const path = currentPath + '/' + item.name;
          const selected = selection.indexOf(path) !== -1;
          return <div
            key={index}
            className={'Body-Item' + (selected ? ' Item-Selected' : '')}
            onClick={event => {
              event.stopPropagation();
              event.preventDefault();
              setSelection([path]);
            }}
            onDoubleClick={event => {
              event.stopPropagation();
              event.preventDefault();
              setSelection([]);
              if (item.type === 1) {
                openFile(path);
              } else {
                setCurrentPath(path);
              }
            }}>
            <div className='Body-Item-Icon'>
              {item.type === 1 ? <FaRegFile/> : <FaRegFolder/>}
            </div>
            <div className="Body-Item-Name" title={item.name} onClick={() => {
              const range = window.getSelection();
              if (selection[0] === path && enabledFeatures.indexOf('rename') !== -1 && !range.toString().length) {
                onRename();
              }
            }}>
              {item.name}
            </div>
          </div>
        })}
      </>}
    </div>
  );
}
