import icon from "./img/effectnode-icon.svg";
import { myWins } from "../utils/myApps";
import { getID } from "../utils/getID";

export function BeginBar({ dateString, useStore }) {
  let apps = useStore((r) => r.apps);
  let wins = useStore((r) => r.wins);
  let editorAPI = useStore((r) => r.editorAPI);
  let overlayPop = useStore((r) => r.overlayPop);

  return (
    <>
      <div className="w-full h-full flex items-center justify-between text-sm">
        <div className="ml-2 w-36 text-white">
          <div
            onClick={() => {
              editorAPI.resetWindow();
            }}
            className="bg-white text-black rounded-full overflow-hidden py-1 m-1 px-1 flex items-center justify-center cursor-pointer"
          >
            Reset Window
          </div>
          {/*  */}
        </div>
        <div className="flex justify-start">
          <div
            onClick={() => {
              if (overlayPop === "menu") {
                useStore.setState({ overlayPop: "" });
              } else if (overlayPop) {
                useStore.setState({ overlayPop: "menu" });
              } else {
                useStore.setState({ overlayPop: "menu" });
              }
            }}
            className="bg-white rounded-full overflow-hidden h-9 m-1 px-4 flex items-center justify-center cursor-pointer"
          >
            <img
              className="fill-white h-full bg-white py-2 select-none"
              src={icon}
            ></img>
          </div>

          {wins.map((win) => {
            //
            // let win = wins.find((r) => r.appID === app._id);
            //

            return (
              <div
                onClick={() => {
                  //
                  useStore.setState({
                    overlayPop: "",
                  });

                  if (win) {
                    editorAPI.upWindow({ win });
                  } else {
                    let app = apps.find((r) => r._id === win.appID);
                    //
                    let appID = app._id;

                    let type = app.type;

                    let win = JSON.parse(
                      JSON.stringify(myWins.find((r) => r.type === type))
                    );
                    win._id = getID();
                    win.appID = appID;

                    // win.zIndex = wins.length;

                    wins.push(win);

                    editorAPI.upWindow({ win });
                  }

                  useStore.setState({
                    apps: [...apps],
                    wins: [...wins],
                  });
                }}
                key={win._id + "appIcon"}
                className="bg-white text-black rounded-full overflow-hidden h-9 m-1 px-4 flex items-center justify-center cursor-pointer"
              >
                {win.title}
              </div>
            );
          })}
        </div>
        <div className="w-52 text-white">
          <div className="flex flex-col justify-end mr-2">
            <div
              className="text-right underline cursor-pointer"
              onClick={() => {
                //
                if (overlayPop === "credits") {
                  useStore.setState({ overlayPop: "" });
                } else if (overlayPop) {
                  useStore.setState({ overlayPop: "credits" });
                } else {
                  useStore.setState({ overlayPop: "credits" });
                }

                //
              }}
            >
              About Credits
            </div>
            <div className="text-right">
              <span>{dateString}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
