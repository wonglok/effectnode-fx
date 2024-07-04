import React from "react";
import SideBarTreeNode from "./SideBarTreeNode";

export default function SideBar({ structure, currentPath, setCurrentPath, collapsed, setCollapsed, labels }) {
  const tree = [];
  const nodesByPath = {};

  Object.keys(structure || {}).forEach(path => {
    const parts = path.split('/');
    let tmpPath = '';
    let childNodes = tree;
    parts.forEach((part, index) => {
      tmpPath += (index > 0 ? '/' : '') + part;
      if (!nodesByPath[tmpPath]) {
        const node = { name: part, path: tmpPath, children: [] };
        childNodes.push(node);
        nodesByPath[tmpPath] = node;
      }
      childNodes = nodesByPath[tmpPath].children;
      if (index === (parts.length - 1)) {
        const children = (structure[tmpPath] || []).filter(item => item.type === 2).map(item => ({
          name: item.name,
          path: tmpPath + '/' + item.name,
          children: []
        }));
        children.forEach(item => {
          if (!childNodes.find(node => node.name === item.name)) {
            childNodes.push(item);
            nodesByPath[tmpPath + '/' + item.name] = item;
          }
        });
      }
    });
  });

  return (
    <div className="FileManager-SideBar">
      <SideBarTreeNode
        node={tree[0] || {}} labels={labels} structure={structure}
        currentPath={currentPath} setCurrentPath={setCurrentPath}
        collapsed={collapsed} setCollapsed={setCollapsed}
      />
    </div>
  );
}
