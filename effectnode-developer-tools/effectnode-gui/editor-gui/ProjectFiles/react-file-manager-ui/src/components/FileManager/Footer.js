import React from "react";
import { FaEdit, FaTrash, FaDownload } from "react-icons/fa";

import { humanReadableByteCount, stripLeadingDirectories } from './Utils';

export default function Footer({ structure, setStructure, currentPath, selection, deletePaths, reload, rename, labels, enabledFeatures, getDownloadLink, getFileSizeBytes, getFileChangedDate }) {
  const list = structure[currentPath] || [];
  const footerText = getFooterText();

  function getFooterText () {
    const files = list.filter(item => item.type === 1).length;
    const folders = list.filter(item => item.type === 2).length;
    const folderLabel = folders > 1 ? labels['folderMultiple'] : labels['folderSingle'];
    const fileLabel = files > 1 ? labels['fileMultiple'] : labels['fileSingle'];
    let text = `${folders} ${folderLabel} and ${files} ${fileLabel}`;

    const selectionItem = selection[0];
    if (selectionItem) {
      let selectionBytes;
      if (enabledFeatures.indexOf('getFileSizeBytes') !== -1) {
        selectionBytes = humanReadableByteCount(getFileSizeBytes(selectionItem));
      }

      let selectionDate;
      if (enabledFeatures.indexOf('getFileChangedDate') !== -1) {
        selectionDate = new Date(getFileChangedDate(selectionItem)).toLocaleString();
      }

      text += ` - ${stripLeadingDirectories(selectionItem)}: `;

      if (selectionBytes) {
        text += `${selectionBytes}`;
      }

      if (selectionDate) {
        if (selectionBytes) {
          text += ', ';
        }
        text += ` ${labels['lastChangedLabel']} ${selectionDate}`;
      }
    }

    return text;
  }

  const onDeletePath = () => {
    deletePaths(selection).then(() => {
      setStructure({});
      reload();
    }).catch(error => error && console.error(error));
  };

  const onRename = () => {
    rename(selection[0]).then(reload).catch(error => error && console.error(error));
  };

  return (
    <div className="FileManager-Footer">
      <div className='Footer-Left'>
        {footerText}
      </div>
      <div className='Footer-Right'>
        {selection.length === 1 && enabledFeatures.indexOf('rename') !== -1 &&
        <button className="Icon-Button" type="button" onClick={() => onRename()} title={labels['rename']}>
          <FaEdit/>
        </button>
        }
        {!!selection.length && enabledFeatures.indexOf('deletePaths') !== -1 &&
        <button className="Icon-Button" type="button" onClick={() => onDeletePath()} title={labels['delete']}>
          <FaTrash/>
        </button>
        }
        {!!selection.length && enabledFeatures.indexOf('getDownloadLink') !== -1 &&
        <a href={getDownloadLink(selection)} download={stripLeadingDirectories(selection[0])} className="Icon-Button" type="button"
            title={labels['download']}>
          <FaDownload/>
        </a>
        }
      </div>
    </div>
  );
}
