// import { Box, PerspectiveCamera } from "@react-three/drei";
// import { useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import { Clock } from "three";
import { getTags } from "../ai/tags";
// import Editor from "@monaco-editor/react";
import { pullModel } from "../ai/model";
import { askGLSL } from "../ai/chat";

export function ToolBox({
  useStore,
  boxData,
  saveBoxData,
  setToolboxFullScreen,
}) {
  useEffect(() => {
    // init

    setToolboxFullScreen(true);
  }, [setToolboxFullScreen]);

  let screenAt = useStore((r) => r.screenAt);
  let activeModel = useStore((r) => r.activeModel);
  let genConsole = useStore((r) => r.genConsole);
  let models = useStore((r) => r.models);
  let ollamaOffline = useStore((r) => r.ollamaOffline);

  useEffect(() => {
    useStore.setState({
      screenAt: "pull-model",
    });
  }, [useStore]);

  let loadModel = useCallback(() => {
    return getTags()
      .then((data) => {
        //

        let models = data.models || [];

        console.log(models);

        useStore.setState({
          models: models,
        });
        //

        useStore.setState({
          ollamaOffline: false,
        });

        return { ollamaOffline: false };

        //
      })
      .catch((r) => {
        useStore.setState({
          ollamaOffline: true,
        });

        return { ollamaOffline: true };
      });

    //
  }, [useStore]);

  let [logs, setLogs] = useState([]);
  let pullStarCoder = useCallback(() => {
    //

    setLogs([]);
    pullModel({
      name: "codellama",
      onMessage: ({ text }) => {
        //
        try {
          let jsons = text
            .trim()
            .split("\n")
            .filter((r) => r)
            .map((r) => r.trim())
            .map((json) => {
              return JSON.parse(json);
            });

          jsons.forEach((json) => {
            setLogs((r) => {
              return [
                ...r,
                <div key={"_" + Math.random()}>{JSON.stringify(json)}</div>,
              ];
            });
            setTimeout(() => {
              let logsollama = document.querySelector("#logsollama");
              if (logsollama) {
                logsollama.scrollTop = 10000000000000;
              }
            });
            //  logsollama
            return; ///
          });

          //
        } catch (e) {
          console.log(e);
        }
      },
    })
      .then((r) => r.text())
      .then((r) => {
        setTimeout(() => {
          useStore.setState({
            screenAt: "generator",
            activeModel: "codellama",
          });
          localStorage.setItem("haCodeLlamaCoder", "haCodeLlamaCoder");
        }, 1500);

        console.log(r);
      });
  }, [useStore]);

  useEffect(() => {
    loadModel().then(({ ollamaOffline }) => {
      if (!ollamaOffline) {
        if (localStorage.getItem("haCodeLlamaCoder") === "haCodeLlamaCoder") {
          useStore.setState({
            screenAt: "generator",
            activeModel: "codellama",
          });
        } else {
          pullStarCoder();
        }
      }
    });
  }, [loadModel, pullStarCoder, useStore]);

  return (
    <>
      {ollamaOffline && (
        <>
          <div className="w-full h-full flex items-center justify-center">
            Ollama is Offline...
          </div>
          {/*  */}
        </>
      )}
      {!ollamaOffline && (
        <div className="w-full h-full">
          {screenAt === "pull-model" && (
            <div className=" w-full h-full flex items-center justify-center">
              <div className="h-full">
                <button
                  onClick={() => {
                    //
                    // ollama pull codellama
                    //
                    pullStarCoder();
                  }}
                  className="p-1 bg-blue-200"
                >
                  Download Starcoder (Pull)
                </button>

                <div
                  id="logsollama"
                  className={"overflow-scroll"}
                  style={{ height: `calc(100% - 30px)` }}
                >
                  {logs}
                </div>
              </div>
            </div>
          )}
          {screenAt === "generator" && activeModel && (
            <div className=" w-full h-full text-xs">
              <div className="flex" style={{ height: `calc(80px)` }}>
                <textarea
                  placeholder={`complete the following GLSL code with given input, try to be using ggx to create a blue gradient effect, use a sphere SDF function
vec4 mainImage (vec2 uv, vec3 normal, vec3 viewDirection) {

}`}
                  defaultValue={`complete the following GLSL code with given input, try to be using ggx to create a blue gradient effect, use a sphere SDF function
vec4 mainImage (vec2 uv, vec3 normal, vec3 viewDirection) {

}`}
                  className="p-1 flex-grow"
                  rows={1}
                  id="shaderprompt"
                ></textarea>
                <button
                  onClick={async () => {
                    //
                    let canWrite = true;
                    //
                    console.log("shaderprompt");
                    //

                    let promptElement = document.querySelector("#shaderprompt");

                    let fullResponse = "";
                    askGLSL({
                      modelName: activeModel,
                      messages: [
                        {
                          role: "user",
                          content: promptElement.value,
                        },
                      ],
                      onDone: () => {
                        canWrite = false;
                      },
                      onMessage: ({ text }) => {
                        fullResponse += text;

                        let genconsole = document.querySelector("#genconsole");

                        if (genconsole && canWrite) {
                          useStore.setState({
                            genConsole: <span>{fullResponse}</span>,
                          });

                          genconsole.scrollTop = 99999999999999;
                        }
                      },
                    });
                  }}
                  className="p-1 bg-gray-200"
                >
                  AI Shader Generation
                </button>
              </div>
              <div
                className=" px-2 pb-2  select-text"
                style={{ height: `calc(100% - 80px)` }}
              >
                <pre
                  id="genconsole"
                  className="w-full h-full overflow-scroll whitespace-pre-wrap"
                >
                  {genConsole}
                </pre>
              </div>
            </div>
          )}
          {false && (
            <>
              <div className="flex">
                {models && (
                  <>
                    <select
                      className="p-1 bg-green-200"
                      onChange={(v) => {
                        console.log(v);
                      }}
                      defaultValue={""}
                    >
                      {models &&
                        models.map((m) => {
                          return (
                            <option key={m.digest + m.model} value={m.model}>
                              {m.name}
                            </option>
                          );
                        })}
                    </select>
                    <button
                      onClick={() => {
                        //
                        //
                      }}
                      className="p-1 bg-gray-200"
                    >
                      Choose
                    </button>
                  </>
                )}
              </div>
            </>
          )}

          {/* <Editor
          height={`100%`}
          defaultLanguage="javascript"
          defaultValue={`${code.code}`}
          onMount={(editor, monaco) => {
            setEditor(editor);
            setMonaco(monaco);
          }}
          onChange={(text) => {
            code.code = text;

            useStore.setState({
              settings: [...settings],
            });
          }}
        ></Editor> */}

          {/*  */}
          {/*  */}
          {/*  */}
        </div>
      )}
    </>
  );
}

export function Runtime({ ui, io, useStore, onLoop }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);

  let ref = useRef();

  useEffect(() => {
    let clock = new Clock();
    return onLoop(() => {
      let dt = clock.getDelta();

      if (ref.current) {
        ref.current.rotation.y += dt * ui.speed;
      }
    });
  }, [onLoop, ui]);

  let [color, setColor] = useState("#ffffff");

  useEffect(() => {
    io.in(0, (color) => {
      setColor(color);
    });
  }, [ui, io]);

  return (
    <>
      <Insert3D>
        <group ref={ref}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry></boxGeometry>
            <meshStandardMaterial color={color}></meshStandardMaterial>
          </mesh>
        </group>
      </Insert3D>
    </>
  );
}

//

//

//
