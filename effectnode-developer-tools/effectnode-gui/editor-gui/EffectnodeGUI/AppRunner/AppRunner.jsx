import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getID } from "../utils/getID";

export function AppRunner({
  useCore,
  state,
  win,
  getState = () => {
    console.log("not implemented!!!");
  },
  spaceID,
}) {
  let ref = useRef();
  let el = useMemo(() => {
    let el = document.createElement("iframe");
    el.classList.add("w-full");
    el.classList.add("h-full");
    return el;
  }, []);

  useEffect(() => {
    ref.current.innerHTML = "";
    ref.current.appendChild(el);
    return () => {
      el.remove();
    };
  }, [el]);

  let launcher = useMemo(() => {
    return getID();
  }, []);

  useEffect(() => {
    if (!spaceID) {
      return;
    }
    if (!el) {
      return;
    }

    if (
      el.src !== `/iframe/FrameRun?launcher=${encodeURIComponent(launcher)}`
    ) {
      el.src = `/iframe/FrameRun?launcher=${encodeURIComponent(launcher)}`;
    }

    return () => {
      //
    };
  }, [launcher, el, spaceID]);

  let send = useCallback(
    ({ action = "action", payload = {} }) => {
      return el?.contentWindow?.postMessage(
        {
          launcher: launcher,
          action: action,
          payload: payload,
        },
        {
          targetOrigin: `${location.origin}`,
        }
      );
    },
    [el?.contentWindow, launcher]
  );

  useEffect(() => {
    send({
      action: "resize",
      payload: { ...win },
    });
    return () => {
      //
    };
  }, [send, win, win.width, win.height]);

  useEffect(() => {
    if (!state) {
      return;
    }
    send({
      action: "pushLatestState",
      payload: state,
    });
  }, [send, state]);

  useEffect(() => {
    let reloadHandler = () => {
      el?.contentWindow?.location?.reload();
    };

    window.addEventListener("editor-save", reloadHandler);

    return () => {
      window.removeEventListener("editor-save", reloadHandler);
    };
  }, []);

  useEffect(() => {
    let hh = (ev) => {
      //
      if (
        ev?.data?.launcher === launcher &&
        ev.origin === location.origin &&
        ev.data
      ) {
        //
        let payload = ev.data.payload;
        let action = ev.data.action;

        // console.log("[payload]", payload);
        // console.log("[action]", action);

        if (action === "requestLaunchApp") {
          let backupState = getState(); //useStore.getState().editorAPI.exportBackup();

          send({
            action: "responseLaunchApp",
            payload: backupState,
          });
        }

        // if (action === "requestLatestState") {
        //   let state = getState(); // useStore.getState().editorAPI.exportBackup();

        //   send({
        //     action: "respondLatestState",
        //     payload: state,
        //   });
        // }
      }
    };

    window.addEventListener("message", hh);

    return () => {
      window.removeEventListener("message", hh);
    };
  }, [launcher, send, getState]);

  return (
    <>
      <div
        style={{ height: `30px` }}
        className="bg-gray-200 border-b border-gray-400 px-2 flex items-center"
      >
        <button
          className=" text-xs mr-2 underline"
          onClick={() => {
            let href = el.contentWindow.location.href;
            el.contentWindow.location.assign(href);
          }}
        >
          ♻️ Reload
        </button>
      </div>
      <div style={{ height: `calc(100% - 30px)` }}>
        <div ref={ref} className="w-full h-full"></div>
      </div>
    </>
  );
}

//

//

//
