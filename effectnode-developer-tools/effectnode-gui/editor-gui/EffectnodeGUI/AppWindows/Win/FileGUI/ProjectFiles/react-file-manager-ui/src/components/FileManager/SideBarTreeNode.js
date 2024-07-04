import React from "react";
import { FaFolder, FaFolderOpen } from "react-icons/fa";

const OFFSET = 16;

export default function SideBarTreeNode({ node, labels, structure, currentPath, setCurrentPath, collapsed, setCollapsed, level }) {
  return (
    <div className='SideBar-TreeNode'>
      <div className={'TreeNode-Name' + (currentPath === node.path ? ' TreeNode-Current' : '')}
           onClick={() => {
             if (currentPath === node.path) {
               setCollapsed({ ...collapsed, [node.path]: !collapsed[node.path] });
             } else {
               setCollapsed({ ...collapsed, [node.path]: false });
             }
             setCurrentPath(node.path);
           }}
           style={{ paddingLeft: 8 + (level || 0) * OFFSET + 'px' }}>
        {!collapsed[node.path] && structure[node.path] ? <FaFolderOpen/> : <FaFolder/>} {node.name || labels['root']}
      </div>
      {!!node.children && !!node.children.length && !collapsed[node.path] &&
      <div className="TreeNode-Children">
        {node.children.map((item, index) => {
          return <SideBarTreeNode
            key={index} node={item} labels={labels} level={(level || 0) + 1}
            currentPath={currentPath} setCurrentPath={setCurrentPath}
            collapsed={collapsed} setCollapsed={setCollapsed} structure={structure}
          />
        })}
      </div>
      }
    </div>
  );
}
