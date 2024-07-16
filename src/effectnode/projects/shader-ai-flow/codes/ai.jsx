// import { Box, PerspectiveCamera } from "@react-three/drei";
// import { useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import { Clock } from "three";
import { getTags } from "../ai/tags";
// import Editor from "@monaco-editor/react";
import { pullModel } from "../ai/model";
import { askGLSL } from "../ai/chat";
import { Editor } from "@monaco-editor/react";

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

  let [editor, setEditor] = useState();
  let [monaco, setMonaco] = useState();
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
  let pullStarCoder = useCallback(async () => {
    //

    setLogs([]);
    return pullModel({
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

  let onGenerateAI = useCallback(async () => {
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
          role: "ai",
          content: "I am a senior front end developer. i love helping others.",
        },
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

        // let genconsole = document.querySelector("#genconsole");
        // genconsole &&

        if (canWrite) {
          useStore.setState({
            genConsole: fullResponse,
          });
          editor.setValue(fullResponse);

          editor.revealLineInCenter(fullResponse.split("\n").length);

          // genconsole.scrollTop = 99999999999999;
        }
      },
    });
  }, [activeModel, editor, useStore]);

  useEffect(() => {
    loadModel().then(({ ollamaOffline }) => {
      if (!ollamaOffline) {
        if (localStorage.getItem("haCodeLlamaCoder") === "haCodeLlamaCoder") {
          useStore.setState({
            screenAt: "generator",
            activeModel: "codellama",
          });
        } else {
          pullStarCoder().then(() => {
            // return onGenerateAI();
          });
        }
      }
    });
  }, [loadModel, pullStarCoder, onGenerateAI, useStore]);

  return (
    <>
      {ollamaOffline && (
        <>
          <div className="w-full h-full flex items-center justify-center">
            Ollama is Offline...{" "}
            <span
              className="px-2 underline text-blue-500"
              onClick={() => {
                loadModel();
              }}
            >
              Reload
            </span>
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
              <div className="flex" style={{ height: `calc(120px)` }}>
                <textarea
                  placeholder={`
complete the following GLSL function code
vec4 colorRamp (vec3 color1, vec3 color2, float step) {
  // smoothstep
}`.trim()}
                  defaultValue={`
complete the following GLSL function code
vec4 colorRamp (vec3 color1, vec3 color2, float step) {
  // smoothstep
}`.trim()}
                  className="p-2 bg-gray-100 flex-grow"
                  rows={1}
                  id="shaderprompt"
                ></textarea>
                <button onClick={onGenerateAI} className="p-1 bg-gray-200">
                  AI Shader Generation
                </button>
              </div>
              <div
                className=" px-2 pb-2  select-text"
                style={{ height: `calc(100% - 120px)` }}
              >
                <Editor
                  height={`100%`}
                  defaultLanguage="markdown"
                  defaultValue={`${boxData.aiOutput || ""}`}
                  onMount={(editor, monaco) => {
                    setEditor(editor);
                    setMonaco(monaco);

                    editor.updateOptions({
                      wordWrap: "wordWrapColumn",
                      wordWrapColumn: 60,
                    });
                  }}
                  onChange={(text) => {
                    boxData.aiOutput = text;

                    saveBoxData();
                    // code.code = text;
                    // useStore.setState({
                    //   settings: [...settings],
                    // });
                  }}
                ></Editor>

                {/* <pre
                  id="genconsole"
                  className="w-full h-full overflow-scroll whitespace-pre-wrap"
                >
                  {genConsole}
                </pre> */}
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
