import Lottie from "lottie-react";
import blow from "./lottie/confetti.json";

export function ThankYouList({ useStore }) {
  let overlayPop = useStore((r) => r.overlayPop);

  return (
    <>
      {/*  */}

      {overlayPop == "credits" && (
        <div
          className=" z-[99] absolute top-0 left-0 w-full h-full bg-black opacity-20 "
          onClick={() => {
            useStore.setState({
              overlayPop: "",
            });
          }}
        ></div>
      )}

      {overlayPop == "credits" && (
        <div
          className=" z-[100] absolute right-5 shadow-2xl p-2 rounded-2xl border-gray-300 border  backdrop-blur-lg  bg-slate-200  bg-opacity-20 "
          style={{
            width: "500px",
            height: "500px",
            left: `calc(50% - 500px / 2)`,
            bottom: `calc(50% - 500px / 2)`,
          }}
        >
          <div className="bg-white p-3 w-full h-full rounded-xl shadow-inner border-gray-300 border overflow-scroll">
            <Lottie
              className="w-full h-1/3 my-10"
              loop={true}
              animationData={blow}
            ></Lottie>
            <div className="w-full">
              <div className="text-xl  text-center  my-10">
                Thank you Internet for Freebies!
              </div>
              <div className="text-xs text-center flex justify-center">
                <ol className="text-left">
                  <li className=" underline  list-decimal">
                    <a
                      target="_blank"
                      className="text-blue-500"
                      href={`https://github.com/ghzcool/react-file-manager-ui`}
                    >
                      react-file-manager-ui
                    </a>
                  </li>
                  <li className=" underline  list-decimal">
                    <a
                      target="_blank"
                      className="text-blue-500"
                      href={`https://icons8.com`}
                    >
                      Icons8
                    </a>
                  </li>
                  <li className=" underline list-decimal">
                    <a
                      target="_blank"
                      className="text-blue-500"
                      href={`https://threejs.org`}
                    >
                      ThreeJS
                    </a>
                  </li>
                  <li className=" underline  list-decimal">
                    <a
                      target="_blank"
                      className="text-blue-500"
                      href={`https://docs.pmnd.rs/react-three-fiber/getting-started/introduction`}
                    >
                      React Three Fiber
                    </a>
                  </li>
                  <li className=" underline   list-decimal">
                    <a
                      target="_blank"
                      className="text-blue-500"
                      href={`https://lottiefiles.com`}
                    >
                      Lottie Files
                    </a>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      )}

      {/*  */}
    </>
  );
}
