// import Editor from "@monaco-editor/react";
import { useEffect, useState } from "react";
import * as prettier from "prettier/standalone";
import prettierPluginBabel from "prettier/plugins/babel";
import prettierPluginEstree from "prettier/plugins/estree";
import prettierPluginHtml from "prettier/plugins/html";
import { UserInputs } from "./UserInputs/UserInputs";
import { EffectNode } from "effectnode-developer-tools/effectnode-runtime/EffectNode";
import { useDeveloper } from "effectnode-developer-tools/effectnode-gui/store/useDeveloper";

export function Code({ win, useStore }) {
  let wins = useStore((r) => r.wins);
  let graph = useStore((r) => r.graph);
  let settings = useStore((r) => r.settings);
  let nodes = graph.nodes;
  let node = nodes.find((r) => r._id === win.nodeID);
  let code = settings.find((r) => r.nodeID === win.nodeID);

  let spaceID = useStore((r) => r.spaceID);
  let [editor, setEditor] = useState(false);
  let [monaco, setMonaco] = useState(false);

  useEffect(() => {
    let hh = (ev) => {
      if (ev.key === "Escape") {
        useStore.setState({
          wins: JSON.parse(
            JSON.stringify(wins.filter((r) => r._id !== win._id))
          ),
        });
      }
    };

    window.addEventListener("keydown", hh);

    return () => {
      window.removeEventListener("keydown", hh);
    };
  }, [win, wins, useStore]);

  useEffect(() => {
    if (!monaco) {
      return;
    }
    if (!editor) {
      return;
    }
    var myBinding = editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_W,
      function (ev) {
        ev.preventDefault();
        alert("SAVE pressed!");
      }
    );
  }, [editor, monaco]);

  useEffect(() => {
    if (!spaceID) {
      return;
    }
    if (!win.nodeID) {
      return;
    }
    //

    useStore.setState({ showCode: true });

    const alt = (e) => {
      return navigator?.platform?.match("Mac") ? e.metaKey : e.ctrlKey;
    };

    let handler = (ev) => {
      if (alt(ev) && ev.key === "w") {
        ev.preventDefault();
        ev.stopPropagation();

        console.log(ev);
      }
    };
    window.addEventListener("keydown", handler);

    return () => {
      window.addEventListener("keyup", handler);
    };
    //
  }, [code, spaceID, useStore, win.nodeID]);

  return (
    <>
      <div className="w-full h-full " style={{}}>
        <div
          className="w-full text-sm flex items-center  bg-gray-200  border-b border-gray-400"
          style={{ height: "30px" }}
        >
          <span
            className="mx-2 underline"
            onClick={() => {
              //-

              let newTitle = prompt(
                `new title: ${node.title}`,
                `${node.title}`
              );

              if (newTitle) {
                node.title = newTitle;
                win.title = `🧑🏼‍💻 ${newTitle}`;

                useStore.setState({
                  wins: [...wins],
                });
              }
            }}
          >
            Rename Title
          </span>

          <span
            className="mx-2 underline"
            onClick={() => {
              //

              useDeveloper.getState().openEditor({
                title: spaceID,
                nodeTitle: node.title,
              });
              //
            }}
          >
            Open Editor
          </span>

          {/* fileName */}
          <span
            className="mx-2 underline text-red-500"
            onClick={() => {
              //
              if (prompt(`remove "${node.title}" permanent?`, "no") === "yes") {
                //
                graph.nodes = graph.nodes.filter(
                  //
                  (r) => r._id !== win.nodeID
                );

                graph.edges = graph.edges.filter(
                  (r) => r.input.nodeID !== win.nodeID
                );
                graph.edges = graph.edges.filter(
                  (r) => r.output.nodeID !== win.nodeID
                );

                graph.nodes = [...graph.nodes];
                graph.edges = [...graph.edges];

                useStore.setState({
                  graph: JSON.parse(JSON.stringify(graph)),
                  settings: settings.filter((r) => r.nodeID !== win.nodeID),
                  wins: wins.filter((r) => r._id !== win._id),
                });
              }
              //
            }}
          >
            Remove Node
          </span>
        </div>
        <div className="w-full " style={{ height: "calc(100% - 30px)" }}>
          <div
            onKeyDownCapture={(ev) => {
              // if (ev.metaKey && ev.key === "s") {
              //   ev.preventDefault();
              //   ev.stopPropagation();

              //   let runRun = async () => {
              //     let indexPos = editor
              //       .getModel()
              //       .getOffsetAt(editor.getPosition());

              //     let beforePosition = editor.getPosition();

              //     let beforeState = editor.saveViewState();
              //     // console.log(editor);
              //     let result = await prettier
              //       .formatWithCursor(code.code, {
              //         cursorOffset: indexPos,
              //         parser: "babel",
              //         plugins: [
              //           prettierPluginBabel,
              //           prettierPluginEstree,
              //           prettierPluginHtml,
              //         ],
              //       })
              //       .catch((r) => {
              //         console.error(r);
              //         return code.code;
              //       });

              //     //
              //     // editor.setValue(result.formatted);
              //     //
              //     editor.setPosition(beforePosition);
              //     editor.restoreViewState(beforeState);

              //   };
              //   runRun();
              // }

              const computeOffset = (code, pos) => {
                let line = 1;
                let col = 1;
                let offset = 0;
                while (offset < code.length) {
                  if (line === pos.lineNumber && col === pos.column)
                    return offset;
                  if (code[offset] === "\n") line++, (col = 1);
                  else col++;
                  offset++;
                }
                return -1;
              };

              const computePosition = (code, offset) => {
                let line = 1;
                let col = 1;
                let char = 0;
                while (char < offset) {
                  if (code[char] === "\n") line++, (col = 1);
                  else col++;
                  char++;
                }
                return { lineNumber: line, column: col };
              };

              const alt = (e) => {
                return navigator.userAgent.includes("Mac")
                  ? e.metaKey
                  : e.ctrlKey;
              };
              const hotKeys = async (e) => {
                // Cdm + s formats with prettier
                if (alt(e) && e.keyCode == 83) {
                  e.preventDefault();
                  e.stopPropagation();
                  const val = editor.getValue();
                  const pos = editor.getPosition();

                  let prettyVal = await prettier
                    .formatWithCursor(code.code, {
                      cursorOffset: computeOffset(val, pos),
                      parser: "babel",
                      plugins: [
                        prettierPluginBabel,
                        prettierPluginEstree,
                        prettierPluginHtml,
                      ],
                    })
                    .catch((r) => {
                      console.error(r);
                      return {
                        formatted: code.code,
                        cursorOffset: computeOffset(val, pos),
                      };
                    });

                  editor.executeEdits("prettier", [
                    {
                      identifier: "delete",
                      range: editor.getModel().getFullModelRange(),
                      text: "",
                      forceMoveMarkers: true,
                    },
                  ]);

                  editor.executeEdits("prettier", [
                    {
                      identifier: "insert",
                      range: new monaco.Range(1, 1, 1, 1),
                      text: prettyVal.formatted,
                      forceMoveMarkers: true,
                    },
                  ]);

                  editor.setSelection(new monaco.Range(0, 0, 0, 0));
                  editor.setPosition(
                    computePosition(prettyVal.formatted, prettyVal.cursorOffset)
                  );

                  code.code = prettyVal.formatted;

                  window.dispatchEvent(
                    new CustomEvent("editor-save", {
                      detail: {},
                    })
                  );
                }
                // Cmd + p opens the command palette
                if (alt(e) && e.keyCode == 80) {
                  editor.trigger("anyString", "editor.action.quickCommand");
                  e.preventDefault();
                }
                // Cmd + d prevents browser bookmark dialog
                if (alt(e) && e.keyCode == 68) {
                  e.preventDefault();
                }

                useStore.setState({
                  settings: [...settings],
                });

                //
              };

              hotKeys(ev);

              // container.addEventListener("keydown", hotKeys);
            }}
            className="w-full h-full overflow-hidden rounded-b"
          >
            <div className="flex w-full h-full">
              <div className="h-full" style={{ width: `calc(100% - 300px)` }}>
                <div className="w-full h-full code-window" id={`${win.nodeID}`}>
                  {/* {node?.title} */}

                  {
                    <EffectNode
                      mode="toolbox"
                      projectName={spaceID}
                      useEditorStore={useStore}
                      nodeID={win.nodeID}
                    ></EffectNode>
                  }
                </div>

                {/* {code && (
                  <Editor
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
                  ></Editor>
                )} */}
              </div>
              <div
                className="h-full border-l border-gray-400 bg-gray-400"
                style={{ width: `calc(300px)` }}
              >
                {code && (
                  <UserInputs
                    useStore={useStore}
                    graph={graph}
                    settings={settings}
                    code={code}
                  ></UserInputs>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
