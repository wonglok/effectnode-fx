import { useEffect } from "react";

export function WinGeneric({
  enableCover = false,
  useStore,
  idx,
  win,
  topBar,
  children,
}) {
  let apps = useStore((r) => r.apps);
  let wins = useStore((r) => r.wins);
  let mouseState = useStore((r) => r.mouseState);
  let editorAPI = useStore((r) => r.editorAPI);

  let onMouseMove = (ev) => {
    if (!mouseState) {
      return;
    }
    //
    if (
      mouseState.isDown &&
      mouseState.winID === win._id &&
      mouseState.func === "moveWin"
    ) {
      //
      mouseState.now = [ev.pageX, ev.pageY];

      mouseState.delta = [
        //
        mouseState.now[0] - mouseState.last[0],
        mouseState.now[1] - mouseState.last[1],
      ];
      mouseState.last = [
        //
        ev.pageX,
        ev.pageY,
      ];

      mouseState.accu = [
        //
        mouseState.accu[0] + mouseState.delta[0],
        mouseState.accu[1] + mouseState.delta[1],
      ];

      win.top += mouseState.delta[1];
      win.left += mouseState.delta[0];

      useStore.setState({
        mouseState: {
          ...mouseState,
        },
        wins: [...wins],
      });
    }

    if (
      mouseState.isDown &&
      mouseState.winID === win._id &&
      mouseState.func === "resizeWinBR"
    ) {
      mouseState.now = [ev.pageX, ev.pageY];

      mouseState.delta = [
        //
        mouseState.now[0] - mouseState.last[0],
        mouseState.now[1] - mouseState.last[1],
      ];
      mouseState.last = [ev.pageX, ev.pageY];

      mouseState.accu = [
        //
        mouseState.accu[0] + mouseState.delta[0],
        mouseState.accu[1] + mouseState.delta[1],
      ];

      if (!isNaN(mouseState.delta[0])) {
        win.width += mouseState.delta[0];
      }
      if (!isNaN(mouseState.delta[1])) {
        win.height += mouseState.delta[1];
      }

      useStore.setState({
        mouseState: {
          ...mouseState,
        },
        wins: [...wins],
      });
    }

    if (
      mouseState.isDown &&
      mouseState.winID === win._id &&
      mouseState.func === "resizeWinTR"
    ) {
      mouseState.now = [ev.pageX, ev.pageY];

      mouseState.delta = [
        //
        mouseState.now[0] - mouseState.last[0],
        mouseState.now[1] - mouseState.last[1],
      ];
      mouseState.last = [ev.pageX, ev.pageY];

      mouseState.accu = [
        //
        mouseState.accu[0] + mouseState.delta[0],
        mouseState.accu[1] + mouseState.delta[1],
      ];

      if (!isNaN(mouseState.delta[0])) {
        win.width += mouseState.delta[0];
      }
      if (!isNaN(mouseState.delta[1])) {
        win.height += -mouseState.delta[1];
        win.top += mouseState.delta[1];
      }

      useStore.setState({
        mouseState: {
          ...mouseState,
        },
        wins: [...wins],
      });
    }

    if (
      mouseState.isDown &&
      mouseState.winID === win._id &&
      mouseState.func === "resizeWinBL"
    ) {
      mouseState.now = [ev.pageX, ev.pageY];

      mouseState.delta = [
        //
        mouseState.now[0] - mouseState.last[0],
        mouseState.now[1] - mouseState.last[1],
      ];
      mouseState.last = [ev.pageX, ev.pageY];

      mouseState.accu = [
        //
        mouseState.accu[0] + mouseState.delta[0],
        mouseState.accu[1] + mouseState.delta[1],
      ];

      if (!isNaN(mouseState.delta[0])) {
        win.width += mouseState.delta[0] * -1;
        win.left += mouseState.delta[0];
      }
      if (!isNaN(mouseState.delta[1])) {
        win.height += mouseState.delta[1];
      }

      useStore.setState({
        mouseState: {
          ...mouseState,
        },
        wins: [...wins],
      });
    }

    //
    if (
      mouseState.isDown &&
      mouseState.winID === win._id &&
      mouseState.func === "resizeWinTL"
    ) {
      mouseState.now = [ev.pageX, ev.pageY];

      mouseState.delta = [
        //
        mouseState.now[0] - mouseState.last[0],
        mouseState.now[1] - mouseState.last[1],
      ];
      mouseState.last = [ev.pageX, ev.pageY];

      mouseState.accu = [
        //
        mouseState.accu[0] + mouseState.delta[0],
        mouseState.accu[1] + mouseState.delta[1],
      ];

      if (!isNaN(mouseState.delta[0])) {
        win.width += mouseState.delta[0] * -1;
        win.left += mouseState.delta[0];
      }
      if (!isNaN(mouseState.delta[1])) {
        win.top += mouseState.delta[1];
        win.height += mouseState.delta[1] * -1;
      }

      useStore.setState({
        mouseState: {
          ...mouseState,
        },
        wins: [...wins],
      });
    }
    //
  };

  useEffect(() => {
    if (!mouseState) {
      return;
    }

    window.addEventListener("mousemove", onMouseMove);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, [mouseState, useStore, win, wins]);

  useEffect(() => {
    if (!mouseState) {
      return;
    }
    let hh = (ev) => {
      //
      //
      mouseState = {
        winID: "",
        func: "moveWin",
        isDown: false,
        start: [0, 0],
        now: [0, 0],
        last: [0, 0],
        delta: [0, 0],
        accu: [0, 0],
      };

      useStore.setState({
        mouseState: { ...mouseState },
      });

      window.dispatchEvent(new Event("resize"));
    };

    window.addEventListener("mouseup", hh);

    return () => {
      window.removeEventListener("mouseup", hh);
    };
  }, [mouseState, win]);

  //
  // let upWindow = () => {
  //   let cloned = JSON.parse(JSON.stringify(wins));
  //   let idx = cloned.findIndex((w) => w._id === win._id);
  //   cloned.splice(idx, 1);
  //   cloned.push(win);

  //   wins.forEach((eachWin) => {
  //     let index = cloned.findIndex((e) => e._id === eachWin._id);
  //     eachWin.zIndex = index;
  //   });
  // };

  let active = win.zIndex === wins.length - 1;

  let percentage = active ? 1 : 0;

  let activeGradient = active
    ? `
            linear-gradient(
                hsl(210, 100%, 95%),
                hsl(190, 100%, 70%)
            )
            `
    : `
            linear-gradient(
                hsl(210, ${(percentage * 100).toFixed(0)}%, 90%),
                hsl(190, ${(percentage * 100).toFixed(0)}%, 90%)
            )
            `;

  let activeColor = active ? `#000000` : `#bababa`;

  //
  return (
    <>
      <div
        className="mywindow"
        key={win._id + "win"}
        style={{
          position: "absolute",
          zIndex: `${win.zIndex}`,
          top: `${win.top}px`,
          left: `${win.left}px`,
          width: `${win.width}px`,
          height: `${win.height + 30}px`,
          // border: `gray solid 1px`,
          borderTopLeftRadius: "10px",
          borderTopRightRadius: "10px",
        }}
        onPointerDown={() => {
          editorAPI.upWindow({ win });

          // wins = wins.map((eachWin, idx) => {
          //   eachWin.zIndex = idx;
          //   return eachWin;
          // });

          useStore.setState({
            apps: [...apps],
            wins: [...wins],
          });
        }}
      >
        <div
          className="w-full  flex justify-between"
          //
          style={{
            height: `30px`,
            borderTopLeftRadius: "10px",
            borderTopRightRadius: "10px",
            color: activeColor,
            backgroundImage: activeGradient,
            borderTop: "gray solid 1px",
            borderLeft: "gray solid 1px",
            borderRight: "gray solid 1px",
          }}
          //
          onMouseDown={(ev) => {
            mouseState.isDown = true;
            mouseState.winID = win._id;
            mouseState.func = "moveWin";
            mouseState.start = [ev.pageX, ev.pageY];
            mouseState.now = [ev.pageX, ev.pageY];
            mouseState.last = [ev.pageX, ev.pageY];
            useStore.setState({
              mouseState: { ...mouseState },
            });

            // let idx = wins.findIndex((w) => w._id === win._id);
            // wins.splice(idx, 1);
            // wins.push(win);
            editorAPI.upWindow({ win });

            // wins = wins.map((eachWin, idx) => {
            //   eachWin.zIndex = idx;
            //   return eachWin;
            // });

            useStore.setState({
              apps: [...apps],
              wins: [...wins],
            });
            //
          }}
        >
          <div className="flex items-center h-full pl-2">
            <div
              className="w-4 h-4 rounded-full cursor-pointer"
              style={{
                backgroundImage: `
    linear-gradient(
        hsl(0, ${((win.zIndex / (wins.length - 1)) * 100).toFixed(0)}%, 68%),
        hsl(0, ${((win.zIndex / (wins.length - 1)) * 100).toFixed(0)}%, 55%)
    )
                `,
              }}
              onClick={() => {
                //
                useStore.setState({
                  wins: JSON.parse(
                    JSON.stringify(wins.filter((r) => r._id !== win._id))
                  ),
                });
                //
              }}
            ></div>
          </div>
          <div className=" select-none flex items-center h-full">{topBar}</div>
          <div>
            {/*  */}

            {/*  */}
          </div>
        </div>
        <div
          className="w-full relative"
          style={{
            userSelect: "none",
            height: `${win.height}px`,
            backgroundColor: "white",
            borderBottom: "gray solid 1px",
            borderTop: "gray solid 1px",
            borderLeft: "gray solid 1px",
            borderRight: "gray solid 1px",
            borderBottomLeftRadius: "5px",
            borderBottomRightRadius: "5px",
          }}
        >
          {children}
          {enableCover && win.zIndex < wins.length - 1 && (
            <>
              <div
                className="w-full h-full absolute top-0 left-0 "
                style={{ height: `calc(100% - 30px)` }}
              ></div>
            </>
          )}

          {mouseState.isDown && (
            <>
              <div
                className="w-full h-full absolute top-0 left-0 "
                style={{ height: `calc(100% - 30px)` }}
              ></div>
            </>
          )}
        </div>

        {mouseState.isDown && (
          <div
            className="w-full absolute top-0 left-0"
            onMouseMove={(ev) => {
              // ev.nativeEvent
              onMouseMove(ev.nativeEvent);
              // ev.stopPropagation();
              // ev.preventDefault();
            }}
          ></div>
        )}

        <div
          className="w-7 h-7 bg-gray-500 absolute -bottom-3 -right-3 rounded-full hover:opacity-100 opacity-0 duration-300 transition-opacity cursor-se-resize"
          onMouseDown={(ev) => {
            //
            mouseState.isDown = true;
            mouseState.winID = win._id;
            mouseState.func = "resizeWinBR";
            mouseState.start = [ev.pageX, ev.pageY];
            mouseState.now = [ev.pageX, ev.pageY];
            mouseState.last = [ev.pageX, ev.pageY];
            useStore.setState({
              mouseState: { ...mouseState },
            });

            editorAPI.upWindow({ win });

            useStore.setState({
              apps: [...apps],
              wins: [...wins],
            });
          }}
        ></div>

        <div
          className="w-7 h-7 bg-gray-500 absolute -top-3 -right-3 rounded-full hover:opacity-100 opacity-0 duration-300 transition-opacity cursor-ne-resize"
          onMouseDown={(ev) => {
            //
            mouseState.isDown = true;
            mouseState.winID = win._id;
            mouseState.func = "resizeWinTR";
            mouseState.start = [ev.pageX, ev.pageY];
            mouseState.now = [ev.pageX, ev.pageY];
            mouseState.last = [ev.pageX, ev.pageY];
            useStore.setState({
              mouseState: { ...mouseState },
            });

            editorAPI.upWindow({ win });

            // let idx = wins.findIndex((w) => w._id === win._id);
            // wins.splice(idx, 1);
            // wins.push(win);

            // wins = wins.map((eachWin, idx) => {
            //   eachWin.zIndex = idx;
            //   return eachWin;
            // });

            useStore.setState({
              apps: [...apps],
              wins: [...wins],
            });
          }}
        ></div>

        <div
          className="w-7 h-7 bg-gray-500 absolute -bottom-3 -left-3 rounded-full hover:opacity-100 opacity-0 duration-300 transition-opacity cursor-sw-resize"
          onMouseDown={(ev) => {
            //
            mouseState.isDown = true;
            mouseState.winID = win._id;
            mouseState.func = "resizeWinBL";
            mouseState.start = [ev.pageX, ev.pageY];
            mouseState.now = [ev.pageX, ev.pageY];
            mouseState.last = [ev.pageX, ev.pageY];
            useStore.setState({
              mouseState: { ...mouseState },
            });

            // let idx = wins.findIndex((w) => w._id === win._id);
            // wins.splice(idx, 1);
            // wins.push(win);

            editorAPI.upWindow({ win });

            // wins = wins.map((eachWin, idx) => {
            //   eachWin.zIndex = idx;
            //   return eachWin;
            // });

            useStore.setState({
              apps: [...apps],
              wins: [...wins],
            });
          }}
        ></div>

        <div
          className="w-7 h-7 bg-gray-500 absolute -top-3 -left-3 rounded-full hover:opacity-100 opacity-0 duration-300 transition-opacity cursor-nw-resize"
          onMouseDown={(ev) => {
            //
            mouseState.isDown = true;
            mouseState.winID = win._id;
            mouseState.func = "resizeWinTL";
            mouseState.start = [ev.pageX, ev.pageY];
            mouseState.now = [ev.pageX, ev.pageY];
            mouseState.last = [ev.pageX, ev.pageY];
            useStore.setState({
              mouseState: { ...mouseState },
            });

            // let idx = wins.findIndex((w) => w._id === win._id);
            // wins.splice(idx, 1);
            // wins.push(win);

            editorAPI.upWindow({ win });

            // wins = wins.map((eachWin, idx) => {
            //   eachWin.zIndex = idx;
            //   return eachWin;
            // });

            useStore.setState({
              apps: [...apps],
              wins: [...wins],
            });
          }}
        ></div>
      </div>
      {/*  */}
    </>
  );
}
