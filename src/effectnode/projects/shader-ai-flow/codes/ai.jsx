// import { Box, PerspectiveCamera } from "@react-three/drei";
// import { useFrame } from "@react-three/fiber";
import { useCallback, useEffect, useRef, useState } from "react";
import { Clock } from "three";
import { getTags } from "../ai/tags";
// import Editor from "@monaco-editor/react";
import { pullModel } from "../ai/model";
import { askGLSL } from "../ai/chat";
import { Editor } from "@monaco-editor/react";
import SplitPane, { Pane } from "split-pane-react";

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
  let [promptEditor, setPromptEditor] = useState();

  //
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
      name: "llama3",
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
                <div key={"_" + Math.random()} className=" whitespace-pre-wrap">
                  {JSON.stringify(json, null, "  ")}
                </div>,
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
            activeModel: "llama3",
          });
          localStorage.setItem("llama3_cache", "llama3_cache");
        }, 1500);

        console.log(r);
      });
  }, [useStore]);

  let onGenerateAI = useCallback(async () => {
    //
    let canWrite = true;
    //
    let text = promptEditor.getValue();

    let fullResponse = "";
    askGLSL({
      modelName: activeModel,
      messages: [
        // {
        //   role: "ai",
        //   content:
        //     "I am a senior openl-gl graphics developer. i love helping others.",
        // },
        //
        {
          role: "user",
          content: text,
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

          editor.revealLineInCenter(fullResponse.split("\n").length + 1);

          // genconsole.scrollTop = 99999999999999;
        }
      },
    }).then(() => {
      boxData.aiOutput = text;
      saveBoxData();
    });
  }, [activeModel, boxData, editor, promptEditor, saveBoxData, useStore]);

  useEffect(() => {
    loadModel().then(({ ollamaOffline }) => {
      if (!ollamaOffline) {
        if (localStorage.getItem("llama3_cache") === "llama3_cache") {
          useStore.setState({
            screenAt: "generator",
            activeModel: "llama3",
          });
        } else {
          pullStarCoder().then(() => {
            // return onGenerateAI();
          });
        }
      }
    });
  }, [loadModel, pullStarCoder, onGenerateAI, useStore]);

  const [sizes, setSizes] = useState([100, "30%", "auto"]);

  // const layoutCSS = {
  //   height: "100%",
  //   display: "flex",
  //   alignItems: "center",
  //   justifyContent: "center",
  // };
  //

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
                    // ollama pull llama3
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
              <SplitPane split="horizontal" sizes={sizes} onChange={setSizes}>
                <Pane minSize={50}>
                  <div className="flex" style={{ height: `calc(100%)` }}>
                    <Editor
                      height={`100%`}
                      defaultLanguage="markdown"
                      defaultValue={`
Improve and Complete the following openGL GLSL functions for three.js

float perinNoise(in vec2 uv) {}
float waterWavePulse(in vec2 uv, in float time) {
    float wave = sin(uv.x * 0.1 * 200.0 + time * 0.003141592) * 0.5 + 0.5; 
    return wave; 
}

                  `.trim()}
                      onMount={(editor, monaco) => {
                        setPromptEditor(editor);

                        editor.updateOptions({
                          wordWrap: "on",
                        });
                      }}
                      onChange={(text) => {}}
                    ></Editor>

                    <button onClick={onGenerateAI} className="p-1 bg-gray-200">
                      AI Shader Generation
                    </button>
                  </div>
                  <div className="h-[2px] bg-gray-400"></div>
                </Pane>
                <Pane minSize={50}>
                  <div className="h-[2px] bg-gray-400"></div>
                  <Editor
                    height={`100%`}
                    defaultLanguage="markdown"
                    defaultValue={`${boxData.aiOutput || ""}`}
                    onMount={(editor, monaco) => {
                      setEditor(editor);
                      setMonaco(monaco);

                      editor.updateOptions({
                        wordWrap: "on",
                      });
                    }}
                    onChange={(text) => {
                      boxData.aiOutput = text;
                      saveBoxData();
                    }}
                  ></Editor>
                </Pane>
              </SplitPane>

              <div
                className=" px-2 pb-2  select-text"
                style={{ height: `calc(100% - 50%)` }}
              >
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
        </div>
      )}
    </>
  );
}

export function Runtime() {
  return null;
}
