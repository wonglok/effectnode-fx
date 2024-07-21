import { getID } from "effectnode-developer-tools/effectnode-gui/editor-gui/EffectnodeGUI/utils/getID";
import { useEffect, useRef, useState } from "react";
import { Pane } from "tweakpane";

export function UserInputs({ useStore, code, settings, graph }) {
  let data = code.data || [];

  return (
    <>
      {/*  */}
      <div className="h-2"></div>
      <div className="mx-2 mb-2">
        <AddInputs
          code={code}
          settings={settings}
          useStore={useStore}
        ></AddInputs>
      </div>

      {data.map((dat) => {
        return (
          <div key={dat._id}>
            {/*  */}

            {/*  */}
            {dat.type === "range" && (
              <>
                <Gear
                  settings={settings}
                  gear={
                    <RangeGear
                      code={code}
                      settings={settings}
                      useStore={useStore}
                      dat={dat}
                    ></RangeGear>
                  }
                  useStore={useStore}
                  dat={dat}
                >
                  <RangedInput
                    settings={settings}
                    useStore={useStore}
                    dat={dat}
                  ></RangedInput>
                </Gear>
              </>
            )}

            {dat.type === "files" && (
              <>
                <Gear
                  gear={
                    <FilesGear
                      code={code}
                      settings={settings}
                      useStore={useStore}
                      dat={dat}
                    ></FilesGear>
                  }
                  settings={settings}
                  useStore={useStore}
                  dat={dat}
                >
                  <FilesInput
                    settings={settings}
                    useStore={useStore}
                    dat={dat}
                  ></FilesInput>
                </Gear>
              </>
            )}

            {dat.type === "text" && (
              <>
                <Gear
                  gear={
                    <TextGear
                      code={code}
                      settings={settings}
                      useStore={useStore}
                      dat={dat}
                    ></TextGear>
                  }
                  settings={settings}
                  useStore={useStore}
                  dat={dat}
                >
                  <TextInput
                    settings={settings}
                    useStore={useStore}
                    dat={dat}
                  ></TextInput>
                </Gear>
              </>
            )}

            {dat.type === "color" && (
              <>
                <Gear
                  gear={
                    <ColorGear
                      code={code}
                      settings={settings}
                      useStore={useStore}
                      dat={dat}
                    ></ColorGear>
                  }
                  settings={settings}
                  useStore={useStore}
                  dat={dat}
                >
                  <ColorInput
                    settings={settings}
                    useStore={useStore}
                    dat={dat}
                  ></ColorInput>
                </Gear>
              </>
            )}

            {/*  */}
            {/*  */}
          </div>
        );
      })}

      {/*  */}
    </>
  );
}

function AddInputs({ useStore, code, settings }) {
  let refValue = useRef();

  useEffect(() => {
    const pane = new Pane({ container: refValue.current });

    let templates = [
      {
        _id: getID(),
        label: "speed",
        type: "range",
        min: 0,
        max: 1,
        step: 0.01,
        value: 0,
      },
      {
        _id: getID(),
        label: "baseColor",
        type: "color",
        value: "#ff0000",
      },
      {
        _id: getID(),
        label: "name",
        type: "text",
        value: "hi dear",
      },
      {
        _id: getID(),
        label: "file",
        type: "files",
        value: "",
      },
    ];

    let idx = 0;

    pane
      .addBlade({
        view: "list",
        label: "Add New Input",
        options: templates.map((tt, idx) => {
          return {
            text: tt.type,
            value: idx,
          };
        }),

        // [
        //   { text: "loading", value: "LDG" },
        //   { text: "menu", value: "MNU" },
        //   { text: "field", value: "FLD" },
        // ],
        value: 0,
      })
      .on("change", (ev) => {
        idx = ev.value;
        btn.title = `Add: ${templates[idx].type}`;
      });

    const btn = pane.addButton({
      title: `Add: range`,
      label: "input type", // optional
    });

    btn.on("click", () => {
      //
      code.data.push({
        ...JSON.parse(JSON.stringify(templates[idx])),
        _id: getID(),
      });
      useStore.setState({
        settings: [...settings],
      });
      //
      //
    });

    ///////

    return () => {
      pane.dispose();
    };
  }, []);

  return (
    <>
      <div ref={refValue}></div>
    </>
  );
}

function ColorGear({ useStore, code, settings, dat }) {
  let refValue = useRef();

  useEffect(() => {
    const pane = new Pane({ container: refValue.current });

    pane.addBinding(dat, "label", {}).on("change", (v) => {
      dat.label = v.value;

      useStore.setState({
        settings: [...settings],
      });
    });

    const btn = pane.addButton({
      title: "remove this",
      label: `${dat.label}`, // optional
    });

    btn.on("click", () => {
      //
      let res = window.confirm("remove " + dat.label + " ?");
      if (res) {
        code.data = code.data.filter((r) => r._id !== dat._id);

        useStore.setState({
          settings: [...settings],
        });
      }
      //
    });

    return () => {
      pane.dispose();
    };
  }, [dat]);

  return (
    <>
      <div ref={refValue}></div>
    </>
  );
}

function FilesGear({ useStore, code, settings, dat }) {
  let refValue = useRef();

  useEffect(() => {
    const pane = new Pane({ container: refValue.current });

    pane.addBinding(dat, "label", {}).on("change", (v) => {
      dat.label = v.value;

      useStore.setState({
        settings: [...settings],
      });
    });

    const btn = pane.addButton({
      title: "remove this",
      label: `${dat.label}`, // optional
    });

    btn.on("click", () => {
      //
      let res = window.confirm("remove " + dat.label + " ?");
      if (res) {
        code.data = code.data.filter((r) => r._id !== dat._id);

        useStore.setState({
          settings: [...settings],
        });
      }
      //
    });

    return () => {
      pane.dispose();
    };
  }, [dat]);

  return (
    <>
      <div ref={refValue}></div>
    </>
  );
}
function TextGear({ useStore, code, settings, dat }) {
  let refValue = useRef();

  useEffect(() => {
    const pane = new Pane({ container: refValue.current });

    pane.addBinding(dat, "label", {}).on("change", (v) => {
      dat.label = v.value;

      useStore.setState({
        settings: [...settings],
      });
    });

    const btn = pane.addButton({
      title: "remove this",
      label: `${dat.label}`, // optional
    });

    btn.on("click", () => {
      //
      let res = window.confirm("remove " + dat.label + " ?");
      if (res) {
        code.data = code.data.filter((r) => r._id !== dat._id);

        useStore.setState({
          settings: [...settings],
        });
      }
      //
    });

    return () => {
      pane.dispose();
    };
  }, [dat]);

  return (
    <>
      <div ref={refValue}></div>
    </>
  );
}

function RangeGear({ useStore, code, settings, dat }) {
  let refValue = useRef();

  useEffect(() => {
    const pane = new Pane({ container: refValue.current });

    pane.addBinding(dat, "label", {}).on("change", (v) => {
      dat.label = v.value;

      useStore.setState({
        settings: [...settings],
      });
    });

    dat.min = dat.min || 0;
    pane
      .addBinding(dat, "min", {
        step: 0.01,
      })
      .on("change", (v) => {
        dat.value = v.value;

        useStore.setState({
          settings: [...settings],
        });
      });

    //

    dat.max = dat.max || 1;
    pane
      .addBinding(dat, "max", {
        step: 0.01,
      })
      .on("change", (v) => {
        dat.value = v.value;

        useStore.setState({
          settings: [...settings],
        });
      });

    dat.step = dat.step || 0.01;
    pane
      .addBinding(dat, "step", {
        step: 0.01,
      })
      .on("change", (v) => {
        dat.value = v.value;

        useStore.setState({
          settings: [...settings],
        });
      });

    const btn = pane.addButton({
      title: "remove this",
      label: `${dat.label}`, // optional
    });

    btn.on("click", () => {
      //
      let res = window.confirm("remove " + dat.label + " ?");
      if (res) {
        code.data = code.data.filter((r) => r._id !== dat._id);

        useStore.setState({
          settings: [...settings],
        });
      }
      //
    });

    return () => {
      pane.dispose();
    };
  }, [dat]);

  return (
    <>
      <div ref={refValue}></div>
    </>
  );
}

function Gear({ useStore, settings, dat, children, gear = null }) {
  let [show, setShow] = useState(false);

  if (!gear) {
    return (
      <div className="mx-2 mb-2 flex items-start">
        <div style={{ width: `calc(100% - 0px)` }} className="h-full">
          {children}
        </div>
      </div>
    );
  }
  return (
    <>
      {show === false && (
        <div className="mx-2 mb-2 flex items-start">
          <div style={{ width: `calc(100% - 28px)` }} className="h-full">
            {children}
          </div>

          <div
            onClick={() => {
              setShow(!show);
            }}
            className="h-28px] w-[28px] text-xs flex items-start justify-center ml-1"
          >
            <img className="w-full cursor-pointer" src={`/img/gears.png`}></img>
          </div>
        </div>
      )}

      {show === true && (
        <div className="mx-2 mb-2 flex items-start">
          <div style={{ width: `calc(100% - 28px)` }} className="h-full">
            {gear}
          </div>

          <div
            onClick={() => {
              setShow(!show);
            }}
            className="h-28px] w-[28px] text-xs flex items-start justify-center ml-1"
          >
            <img className="w-full cursor-pointer" src={`/img/gears.png`}></img>
          </div>
        </div>
      )}
    </>
  );
}

function RangedInput({ useStore, settings, dat }) {
  let refValue = useRef();

  useEffect(() => {
    const PARAMS = {};
    PARAMS[dat.label] = isNaN(dat.value) ? 0 : dat.value || 0;

    const pane = new Pane({ container: refValue.current });

    pane
      .addBinding(PARAMS, dat.label, {
        step: dat.step || 0.01,
      })
      .on("change", (v) => {
        dat.value = v.value;

        useStore.setState({
          settings: [...settings],
        });
      });

    return () => {
      pane.dispose();
    };
  }, [dat]);

  return (
    <>
      <div ref={refValue}></div>
    </>
  );
}

function TextInput({ useStore, settings, dat }) {
  let refValue = useRef();

  useEffect(() => {
    const PARAMS = {};
    PARAMS[dat.label] = dat.value || " ";

    const pane = new Pane({ container: refValue.current });

    pane.addBinding(PARAMS, dat.label, {}).on("change", (v) => {
      dat.value = v.value;

      useStore.setState({
        settings: [...settings],
      });
    });

    return () => {
      pane.dispose();
    };
  }, [dat]);

  return (
    <>
      <div ref={refValue}></div>
    </>
  );
}

function ColorInput({ useStore, settings, dat }) {
  let refValue = useRef();

  useEffect(() => {
    const PARAMS = {};
    PARAMS[dat.label] = dat.value || "#ffffff";

    const pane = new Pane({ container: refValue.current });

    pane.addBinding(PARAMS, dat.label, {}).on("change", (v) => {
      dat.value = v.value;
      useStore.setState({
        settings: [...settings],
      });
    });

    return () => {
      pane.dispose();
    };
  }, [dat]);

  return (
    <>
      <div ref={refValue}></div>
    </>
  );
}

//

function FilesInput({ useStore, settings, dat }) {
  let refValue = useRef();
  let spaceID = useStore((r) => r.spaceID);

  useEffect(() => {
    let options = loadAssets({ projectName: spaceID });
    const PARAMS = {};
    PARAMS[dat.label] = dat.value || " ";

    const pane = new Pane({ container: refValue.current });

    pane
      .addBinding(PARAMS, dat.label, {
        options: options,
      })
      .on("change", (v) => {
        dat.value = v.value;

        useStore.setState({
          settings: [...settings],
        });
      });

    return () => {
      pane.dispose();
    };
  }, [dat]);

  return (
    <>
      <div ref={refValue}></div>
    </>
  );
}

function loadAssets({ projectName }) {
  let output = {};

  let rr = require.context(
    "src/effectnode/projects",
    true,
    /\/assets\/(.*).(png|jpg|hdr|jpeg|glb|gltf|fbx|exr|mp4|task|wasm|webm)$/,
    "sync"
  );

  let list = rr.keys();

  list.forEach((key) => {
    if (key.startsWith("./") && key.includes(`/${projectName}/`)) {
      let filePath = key.split("/assets")[1];

      output[filePath] = filePath;
    }
  });

  return output;
}
