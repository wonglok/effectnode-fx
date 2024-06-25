export const myApps = [
  {
    _id: "appID",
    type: "editor",
    appIconText: " ✨ Editor",
  },
  {
    _id: "appID",
    type: "previewer",
    appIconText: " 🖼️ previewer",
  },
];

export const myWins = [
  {
    _id: "winID",
    appID: "appID",
    type: "editor",
    title: ` ✨ Editor`,
    top: 10,
    left: 10,
    width: 300,
    height: 300,
    zIndex: 0,
  },
  {
    _id: "winID",
    appID: "appID",
    type: "previewer",
    title: ` 🖼️ Previewer`,
    top: 20,
    left: 20,
    width: 300,
    height: 300,
    zIndex: 0,
  },
  {
    _id: "winID",
    appID: "appID",
    type: "coder",
    title: ` 👨🏼‍💻 Coder`,
    top: 20,
    left: 20,
    width: 900,
    height: 500,
    zIndex: 0,
    data: {},
  },
];
