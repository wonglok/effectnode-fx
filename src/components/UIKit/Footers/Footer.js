import React from "react";

export default function Footer() {
  return (
    <>
      <footer className="relative bg-gray-200 pt-8 pb-6">
        <div
          className="bottom-auto top-0 left-0 right-0 w-full absolute pointer-events-none overflow-hidden -mt-20 h-20"
          style={{ transform: "translateY(1px)" }}
        >
          <svg
            className="absolute bottom-0 overflow-hidden"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="none"
            version="1.1"
            viewBox="0 0 2560 100"
            x="0"
            y="0"
          >
            <polygon
              className="text-gray-200 fill-current"
              points="2560 0 2560 100 0 100"
            ></polygon>
          </svg>
        </div>
        <div className="container mx-auto px-4 py-20">
          <div className="flex flex-wrap text-center lg:text-left">
            <div className="w-full lg:w-6/12 px-4">
              <h4 className="text-3xl font-semibold">{`A-Yo!`}</h4>
              <h5 className="text-lg mt-0 mb-2 text-gray-600">
                {`Dont be shy, Let's say hi!`}
              </h5>
              <div className="mt-6 lg:mb-0 mb-6 hidden">
                <button
                  className="bg-white text-blue-400 shadow-lg font-normal h-10 w-10 items-center justify-center align-center rounded-full outline-none focus:outline-none mr-2"
                  type="button"
                >
                  <i className="fab fa-twitter"></i>
                </button>
                <button
                  className="bg-white text-blue-600 shadow-lg font-normal h-10 w-10 items-center justify-center align-center rounded-full outline-none focus:outline-none mr-2"
                  type="button"
                >
                  <i className="fab fa-facebook-square"></i>
                </button>
                <button
                  className="bg-white text-pink-400 shadow-lg font-normal h-10 w-10 items-center justify-center align-center rounded-full outline-none focus:outline-none mr-2"
                  type="button"
                >
                  <i className="fab fa-dribbble"></i>
                </button>
                <button
                  className="bg-white text-gray-800 shadow-lg font-normal h-10 w-10 items-center justify-center align-center rounded-full outline-none focus:outline-none mr-2"
                  type="button"
                >
                  <i className="fab fa-github"></i>
                </button>
              </div>
            </div>
            <div className="w-full lg:w-6/12 px-4">
              <div className="flex flex-wrap items-top mb-6">
                <div className="w-full lg:w-4/12 px-4 ml-auto">
                  <span className="block uppercase text-gray-500 text-sm font-semibold mb-2">
                    Inspiration
                  </span>
                  <ul className="list-unstyled">
                    {/*  */}
                    {/*  */}
                    {/*  */}
                    <li>
                      <a
                        className="text-gray-600 hover:text-gray-800 font-semibold block pb-2 text-sm"
                        href="https://www.bible.com/bible/59/rev.12.11"
                      >
                        Jesus & Bible
                      </a>
                    </li>
                    {/*  */}
                    {/*  */}
                    {/*  */}
                    <li>
                      <a
                        className="text-gray-600 hover:text-gray-800 font-semibold block pb-2 text-sm"
                        href="https://effectnode.com"
                      >
                        Effect Node
                      </a>
                    </li>
                  </ul>
                </div>
                <div className="w-full lg:w-4/12 px-4">
                  <span className="block uppercase text-gray-500 text-sm font-semibold mb-2">
                    Contact Lok
                  </span>
                  <ul className="list-unstyled">
                    <li>
                      <a
                        className="text-gray-600 hover:text-gray-800 font-semibold block pb-2 text-sm"
                        href="https://twitter.com/wonglok831"
                      >
                        Twitter / X
                      </a>
                    </li>
                    <li>
                      <a
                        className="text-gray-600 hover:text-gray-800 font-semibold block pb-2 text-sm"
                        href="https://www.linkedin.com/in/wonglok831/"
                      >
                        Linked In
                      </a>
                    </li>
                    <li>
                      <a
                        className="text-gray-600 hover:text-gray-800 font-semibold block pb-2 text-sm"
                        href="https://github.com/wonglok"
                      >
                        Github
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <hr className="my-6 border-gray-300" />
          <div className="flex flex-wrap items-center md:justify-between justify-center">
            <div className="w-full md:w-4/12 px-4 mx-auto text-center">
              <div className="text-sm text-gray-500 font-semibold py-1">
                Copyright © {new Date().getFullYear()} Campus LLM App by{" "}
                <a
                  href="https://twitter.com/wonglok831"
                  className="text-gray-500 hover:text-gray-800"
                >
                  @wonglok831
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
