// import React from "react";
// import ReactDOM from "react-dom";
// import FileManager from "./components/FileManager/FileManager";
// import "./index.css";

// const paths = {
//   "": [
//     { name: "New folder 1", type: 2 },
//     { name: "New folder 2", type: 2 },
//     { name: "New folder 3", type: 2 },
//     { name: "file.txt", type: 1 },
//   ],
//   "/New folder 1": [
//     { name: "New folder 2", type: 2 },
//     { name: "file 2.txt", type: 1 },
//   ],
//   "/New folder 2": [{ name: "file 5.txt", type: 1 }],
//   "/New folder 3": [{ name: "file 6.txt", type: 1 }],
//   "/New folder 1/New folder 2": [{ name: "New folder 3", type: 2 }],
//   "/New folder 1/New folder 2/New folder 3": [
//     { name: "New folder 4", type: 2 },
//   ],
//   "/New folder 1/New folder 2/New folder 3/New folder 4": [],
// };

// const getList = (path) => {
//   return new Promise((resolve, reject) => {
//     setTimeout(() => (paths[path] ? resolve(paths[path]) : reject()), 100);
//   });
// };

// const createDirectory = (path) => {
//   return new Promise((resolve) => {
//     setTimeout(resolve, 100);
//   });
// };

// const deletePaths = (paths) => {
//   return new Promise((resolve) => {
//     setTimeout(resolve, 100);
//   });
// };

// const openFile = (path) => {
//   alert("openFile " + path);
// };

// const rename = (path) => {
//   return new Promise((resolve) => {
//     setTimeout(resolve, 100);
//   });
// };

// const uploadFiles = (path, files) => {
//   return new Promise((resolve) => {
//     setTimeout(resolve, 100);
//   });
// };

// // ReactDOM.render(
// //   <React.StrictMode>
// //     <FileManager
// //       getList={getList}
// //       createDirectory={createDirectory}
// //       deletePaths={deletePaths}
// //       openFile={openFile}
// //       uploadFiles={uploadFiles}
// //       rename={rename}
// //       features={['createDirectory', 'uploadFiles', 'deletePaths', 'rename']}
// //     />
// //   </React.StrictMode>,
// //   document.getElementById('root')
// // );
