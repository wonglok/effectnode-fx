/** @license
 * MIT License
 * @description
 * Copyright 2024 WONG LOK

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

import { create } from "zustand";
import { EditorApp } from "./EditorApp/EditorApp";
import { useEffect, useRef, useState } from "react";
import { getID } from "./utils/getID";
import { myApps, myWins } from "./utils/myApps";
import { useRouter } from "next/router";
// import { getOneWorkspace } from "@/src/pages/api/Workspace";
import { Vector3 } from "three";
import { useDeveloper } from "effectnode-developer-tools/effectnode-gui/store/useDeveloper";
//
// import localforage from "localforage";
//
export const EditorRoot = ({ title }) => {
  //

  let [val, setVal] = useState(
    <div className="w-full h-full flex items-center justify-center">
      <div className=" text-center">Loading...</div>
    </div>
  );

  let router = useRouter();

  useEffect(() => {
    if (!title) {
      return;
    }
    if (!router) {
      return;
    }

    let core = new EditorCore();

    core.setState({
      spaceID: title,
      settings: [],
      graph: {
        nodes: [],
        edges: [],
      },
    });

    async function hydration() {
      let json = await useDeveloper
        .getState()
        .getProjectGraph({ title: title });

      let settings = json.settings;
      let graph = json.graph;

      graph.edges = graph.edges.filter(
        (ed) =>
          graph.nodes.some((nd) => ed.input.nodeID === nd._id) ||
          graph.nodes.some((nd) => ed.output.nodeID === nd._id)
      );

      core.setState({
        spaceID: title,
        settings: settings,
        graph: graph,
      });
      //
    }

    hydration().then(() => {
      //
      core.bootup();
      core.resetWindow();

      setVal(core.getReactElement());

      async function save() {
        let st = core.exportBackup();

        let title = st.spaceID;
        let settings = st.settings.filter((r) => r);
        let graph = st.graph;

        graph.edges = graph.edges.filter(
          (ed) =>
            graph.nodes.some((nd) => ed.input.nodeID === nd._id) ||
            graph.nodes.some((nd) => ed.output.nodeID === nd._id)
        );

        await useDeveloper.getState().setProjectGraph({
          title,
          json: {
            settings,
            graph,
          },
        });

        console.log("ok, saved");
        //
      }

      let t0 = 0;
      core.onChange((state, before) => {
        if (
          state.settings !== before.settings ||
          state.graph !== before.graph ||
          state.spaceID !== before.spaceID
        ) {
          clearTimeout(t0);
          t0 = setTimeout(() => {
            save();
          }, 250);
        }
      });
    });

    //
  }, [router, title]);

  return <>{val}</>;
};

export class EditorCore {
  constructor() {
    //

    let self = this;

    this.cleans = [];
    this.works = [];
    this.isEditor = true;
    this.domElement = document.createElement("div");
    this.domElement.classList.add("effectnode-app-container");

    this.store = create((set, get) => {
      return {
        editorAPI: self,
        ///
        apps: [],
        wins: [],

        //
        spaceID: false,
        workspace: false,

        //
        graph: {
          nodes: [],
          edges: [],
        },
        settings: [],
        //

        //////
        graphCursorState: {
          nodeID: "",
          socketID: "",
          func: "moveNode",
          isDown: false,

          controls: false,
          ts: new Vector3(),
          last: new Vector3(),
          now: new Vector3(),
          delta: new Vector3(),
          accu: new Vector3(),
          timer: 0,
        },
        ///////

        //
        overlayPop: "",
        set,
        get,

        //
        mouseState: {
          winID: "",
          func: "moveWin",
          isDown: false,
          start: [0, 0],
          now: [0, 0],
          last: [0, 0],
          delta: [0, 0],
          accu: [0, 0],
        },
      };
    });

    this.setState = (v = {}) => {
      this.store.setState(v);
    };
    this.getState = () => {
      return this.store.getState();
    };
    this.onChange = (fnc) => {
      let clean = self.store.subscribe(fnc);
      this.cleans.push(clean);
    };
    this.onLoop = (fnc) => {
      this.works.push(fnc);
    };

    this.onClean = (fnc) => {
      this.cleans.push(fnc);
    };

    this.dispose = () => {
      this.works = [];
      this.cleans.forEach((clean) => {
        clean();
      });
      if (this.domElement.parentNode) {
        this.domElement.parentNode.removeChild(this.domElement);
      }
    };

    this.getReactElement = () => (
      <EditorApp useStore={this.store} parent={this}></EditorApp>
    );

    this.saveKeys = [
      //
      //
      "spaceID",
      "graph",
      "settings",

      //
      "apps",
      "wins",
    ];

    this.exportBackup = () => {
      let st = this.getState();
      let processedData = {};
      for (let kn of this.saveKeys) {
        if (st[kn]) {
          processedData[kn] = JSON.parse(JSON.stringify(st[kn]));
        }
      }

      return processedData;
    };
    this.restoreBackup = (state) => {
      let st = JSON.parse(JSON.stringify(state));
      let processedData = {};
      for (let kn of this.saveKeys) {
        if (st[kn]) {
          processedData[kn] = st[kn];
        }
      }
      this.setState(processedData);
    };

    this.bootup = () => {
      let { apps, wins } = this.getState();
      if (!apps.some((r) => r.type === "editor")) {
        let appID = getID();

        let app = JSON.parse(
          JSON.stringify(myApps.find((r) => r.type === "editor"))
        );
        app._id = appID;

        let win = JSON.parse(
          JSON.stringify(myWins.find((r) => r.type === "editor"))
        );
        win._id = getID();
        win.appID = appID;
        win.zIndex = wins.length;

        apps.push(app);
        wins.push(win);

        this.setState({
          apps: [...apps],
          wins: [...wins],
          overlayPop: "",
        });
      }

      //
      //
      //

      if (!apps.some((r) => r.type === "previewer")) {
        let appID = getID();

        let app = JSON.parse(
          JSON.stringify(myApps.find((r) => r.type === "previewer"))
        );
        app._id = appID;

        let win = JSON.parse(
          JSON.stringify(myWins.find((r) => r.type === "previewer"))
        );
        win._id = getID();
        win.appID = appID;
        win.zIndex = wins.length;

        apps.push(app);
        wins.push(win);

        this.setState({
          apps: [...apps],
          wins: [...wins],
          overlayPop: "",
        });
      }

      this.resetWindow();
      setTimeout(() => {
        this.resetWindow();
      });
    };

    this.resetWindow = () => {
      let { apps, wins } = this.getState();
      ///////

      ///////
      {
        let win = wins.find((r) => r.type === "editor");
        if (win) {
          win.top = 10;
          win.left = 10;
          win.width = window.innerWidth * 0.5;
          win.height = (window.innerHeight - 130) / 2 - 10 - 10;
        }

        this.setState({
          apps: [...apps],
          wins: [...wins],
          overlayPop: "",
        });
      }
      ///////

      ///////
      {
        let win = wins.find((r) => r.type === "previewer");
        if (win) {
          win.width = window.innerWidth * 0.5;
          win.height = (window.innerHeight - 130) / 2 - 15;
          win.top = (window.innerHeight - 130) / 2 + 30;
          win.left = 10;
        }

        this.setState({
          apps: [...apps],
          wins: [...wins],
          overlayPop: "",
        });
      }

      ///////
    };

    this.upWindow = ({ win }) => {
      let { wins } = this.getState();
      let cloned = JSON.parse(JSON.stringify(wins));
      let idx = cloned.findIndex((w) => w._id === win._id);
      cloned.splice(idx, 1);
      cloned.push(win);

      wins.forEach((eachWin) => {
        let index = cloned.findIndex((e) => e._id === eachWin._id);
        eachWin.zIndex = index;
      });
    };
  }
}

//
