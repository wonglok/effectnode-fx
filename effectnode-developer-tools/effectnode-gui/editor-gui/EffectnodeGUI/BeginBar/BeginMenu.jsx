import { getID } from "../utils/getID";
import { myApps, myWins } from "../utils/myApps";
import logo from "./img/logo.svg";
export function BeginMenu({ useStore }) {
  let overlayPop = useStore((r) => r.overlayPop);
  let wins = useStore((r) => r.wins);
  let apps = useStore((r) => r.apps);
  //

  let openWindow = ({ winType }) => {
    let { apps, wins } = useStore.getState();
    if (!apps.some((r) => r.type === winType)) {
      let appID = getID();

      let app = JSON.parse(
        JSON.stringify(myApps.find((r) => r.type === winType))
      );
      app._id = appID;

      let win = JSON.parse(
        JSON.stringify(myWins.find((r) => r.type === winType))
      );
      win._id = getID();
      win.appID = appID;

      apps.push(app);
      wins.push(win);

      useStore.setState({
        apps: [...apps],
        wins: [...wins],
        overlayPop: "",
      });
    } else {
      let app = apps.find((r) => r.type === winType);
      let appID = app._id;

      if (!wins.some((r) => r.type === winType)) {
        let win = JSON.parse(
          JSON.stringify(myWins.find((r) => r.type === winType))
        );
        win._id = getID();
        win.appID = appID;

        apps.push(app);
        wins.push(win);

        useStore.setState({
          apps: [...apps],
          wins: [...wins],
          overlayPop: "",
        });
      }
    }

    useStore.setState({
      overlayPop: "",
    });
  };
  return (
    <>
      {/*  */}
      {overlayPop === "menu" && (
        <>
          <div
            className="z-[100] absolute bottom-0 top-0 w-full h-full border-gray-300 border  bg-black bg-opacity-10 "
            style={{}}
            onClick={() => {
              useStore.setState({
                overlayPop: "",
              });
            }}
          >
            {/*  */}

            {/*  */}

            {/*  */}
          </div>
        </>
      )}
      {overlayPop === "menu" && (
        <div
          className="z-[101] absolute bottom-5 shadow-2xl p-5 rounded-2xl border-gray-300 border  bg-white "
          style={{
            width: "500px",
            height: "500px",
            left: `calc(50% - 500px / 2)`,
          }}
        >
          <div className="absolute -top-10 -right-10 p-5  shadow-lg  rounded-2xl border-gray-300 border   bg-white ">
            <img
              className="h-12 select-none "
              src={logo}
              alt="effectnode"
            ></img>
          </div>

          <div>
            <div
              onClick={() => {
                openWindow({ winType: "editor" });
              }}
              className="cursor-pointer mr-3 mb-3 select-none inline-block p-5 px-6 shadow-md hover:shadow-xl hover:bg-gray-100 active:shadow-lg transition-all duration-300 rounded-2xl border-gray-300 border "
            >
              👨🏼‍💻 Editor
            </div>
            <div
              onClick={() => {
                openWindow({ winType: "previewer" });
              }}
              className="cursor-pointer mr-3 mb-3 select-none inline-block p-5 px-6 shadow-md hover:shadow-xl hover:bg-gray-100 active:shadow-lg transition-all duration-300 rounded-2xl border-gray-300 border "
            >
              🖼️ Previewer
            </div>
          </div>
        </div>
      )}
    </>
  );
}
