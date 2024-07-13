import React from "react";
import Link from "next/link";
// components

import PagesDropdown from "@/components/UIKit/Dropdowns/PagesDropdown.js";

import {
  faCubes,
  faEarthAsia,
  faFile,
  faGraduationCap,
  faHamburger,
  faHand,
  faInbox,
  faMapPin,
  faPerson,
  faPhone,
  faPhoneAlt,
  faTimeline,
  faTimesCircle,
  faUserTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Navbar(props) {
  const [navbarOpen, setNavbarOpen] = React.useState(false);
  return (
    <>
      <nav className="top-0 absolute z-50 w-full flex flex-wrap items-center justify-between px-2 py-3 navbar-expand-lg">
        <div className="container px-4 mx-auto flex flex-wrap items-center justify-between">
          <div className="w-full relative flex justify-between lg:w-auto lg:static lg:block lg:justify-start">
            <Link legacyBehavior href="/">
              <a
                className="text-white text-sm font-bold leading-relaxed inline-block mr-4 py-2 whitespace-nowrap titlecase"
                href="#pablo"
              >
                Effect Node FX
              </a>
            </Link>
            <button
              className="cursor-pointer text-xl leading-none px-3 py-1 border border-solid border-transparent rounded bg-transparent block lg:hidden outline-none focus:outline-none"
              type="button"
              onClick={() => setNavbarOpen(!navbarOpen)}
            >
              <FontAwesomeIcon
                className="fill-white text-white"
                icon={faHamburger}
              />
            </button>
          </div>
          <div
            className={
              "lg:flex flex-grow items-center bg-white lg:bg-opacity-0 lg:shadow-none" +
              (navbarOpen ? " block rounded shadow-lg" : " hidden")
            }
            id="example-navbar-warning"
          >
            {/* <ul className='flex flex-col lg:flex-row list-none mr-auto'>
                            <li className='flex items-center'>
                                <a
                                    className='lg:text-white lg:hover:text-gray-200 text-gray-700 px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold'
                                    href='https://www.creative-tim.com/learning-lab/tailwind/nextjs/overview/notus?ref=nnjs-auth-navbar'
                                >
                                    <i className='lg:text-gray-200 text-gray-400 far fa-file-alt text-lg leading-lg mr-2' />{' '}
                                    Docs
                                </a>
                            </li>
                        </ul> */}
            <ul className="flex flex-col lg:flex-row list-none lg:ml-auto">
              {/* <li className='flex items-center'><PagesDropdown /></li> */}
              {/* <li className='flex items-center'>
                                <a
                                    className='lg:text-white lg:hover:text-gray-200 text-gray-700 px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold'
                                    href='https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fdemos.creative-tim.com%2Fnotus-nextjs%2F'
                                    target='_blank'
                                >
                                    <i className='lg:text-gray-200 text-gray-400 fab fa-facebook text-lg leading-lg ' />
                                    <span className='lg:hidden inline-block ml-2'>Share</span>
                                </a>
                            </li> */}

              {/* <li className='flex items-center'>
                                <a
                                    className='lg:text-white lg:hover:text-gray-200 text-gray-700 px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold'
                                    href='https://twitter.com/intent/tweet?url=https%3A%2F%2Fdemos.creative-tim.com%2Fnotus-nextjs%2F&text=Start%20your%20development%20with%20a%20Free%20Tailwind%20CSS%20and%20NextJS%20UI%20Kit%20and%20Admin.%20Let%20Notus%20NextJS%20amaze%20you%20with%20its%20cool%20features%20and%20build%20tools%20and%20get%20your%20project%20to%20a%20whole%20new%20level.'
                                    target='_blank'
                                >
                                    <i className='lg:text-gray-200 text-gray-400 fab fa-twitter text-lg leading-lg ' />
                                    <span className='lg:hidden inline-block ml-2'>Tweet</span>
                                </a>
                            </li>

                            <li className='flex items-center'>
                                <a
                                    className='lg:text-white lg:hover:text-gray-200 text-gray-700 px-3 py-4 lg:py-2 flex items-center text-xs uppercase font-bold'
                                    href='https://github.com/creativetimofficial/notus-nextjs?ref=nnjs-auth-navbar'
                                    target='_blank'
                                >
                                    <i className='lg:text-gray-200 text-gray-400 fab fa-github text-lg leading-lg ' />
                                    <span className='lg:hidden inline-block ml-2'>Star</span>
                                </a>
                            </li> */}

              <li className="flex justify-center items-center mt-3 mr-3">
                {process.env.NODE_ENV !== "development" && (
                  <a
                    target="_blank"
                    href={`https://github.com/wonglok/effectnode-fx/releases/tag/r0001`}
                  >
                    <button
                      className="bg-white text-gray-700 active:bg-gray-50 text-xs font-bold uppercase px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none lg:mr-1 lg:mb-0 ml-3 mb-3 ease-linear transition-all duration-150 flex items-center"
                      type="button"
                    >
                      <svg
                        width="24"
                        height="24"
                        xmlns="http://www.w3.org/2000/svg"
                        fill-rule="evenodd"
                        clip-rule="evenodd"
                      >
                        <path d="M11.5 8h1v7.826l2.5-3.076.753.665-3.753 4.585-3.737-4.559.737-.677 2.5 3.064v-7.828zm7 12h-13c-2.481 0-4.5-2.019-4.5-4.5 0-2.178 1.555-4.038 3.698-4.424l.779-.14.043-.79c.185-3.447 3.031-6.146 6.48-6.146 3.449 0 6.295 2.699 6.479 6.146l.043.79.78.14c2.142.386 3.698 2.246 3.698 4.424 0 2.481-2.019 4.5-4.5 4.5m.979-9.908c-.212-3.951-3.473-7.092-7.479-7.092s-7.267 3.141-7.479 7.092c-2.57.463-4.521 2.706-4.521 5.408 0 3.037 2.463 5.5 5.5 5.5h13c3.037 0 5.5-2.463 5.5-5.5 0-2.702-1.951-4.945-4.521-5.408" />
                      </svg>
                      <span className="ml-3">Download</span>
                    </button>
                  </a>
                )}

                {process.env.NODE_ENV === "development" && (
                  <a
                    target="_blank"
                    href={`https://github.com/wonglok/effectnode-fx`}
                  >
                    <button
                      className="bg-white text-gray-700 active:bg-gray-50 text-xs font-bold uppercase px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none lg:mr-1 lg:mb-0 ml-3 mb-3 ease-linear transition-all duration-150 flex items-center"
                      type="button"
                    >
                      <svg
                        width="24"
                        height="24"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      >
                        <path d="M12.02 0c6.614.011 11.98 5.383 11.98 12 0 6.623-5.376 12-12 12-6.623 0-12-5.377-12-12 0-6.617 5.367-11.989 11.981-12h.039zm3.694 16h-7.427c.639 4.266 2.242 7 3.713 7 1.472 0 3.075-2.734 3.714-7m6.535 0h-5.523c-.426 2.985-1.321 5.402-2.485 6.771 3.669-.76 6.671-3.35 8.008-6.771m-14.974 0h-5.524c1.338 3.421 4.34 6.011 8.009 6.771-1.164-1.369-2.059-3.786-2.485-6.771m-.123-7h-5.736c-.331 1.166-.741 3.389 0 6h5.736c-.188-1.814-.215-3.925 0-6m8.691 0h-7.685c-.195 1.8-.225 3.927 0 6h7.685c.196-1.811.224-3.93 0-6m6.742 0h-5.736c.062.592.308 3.019 0 6h5.736c.741-2.612.331-4.835 0-6m-12.825-7.771c-3.669.76-6.671 3.35-8.009 6.771h5.524c.426-2.985 1.321-5.403 2.485-6.771m5.954 6.771c-.639-4.266-2.242-7-3.714-7-1.471 0-3.074 2.734-3.713 7h7.427zm-1.473-6.771c1.164 1.368 2.059 3.786 2.485 6.771h5.523c-1.337-3.421-4.339-6.011-8.008-6.771" />
                      </svg>
                      <span className="ml-3">Github</span>
                    </button>
                  </a>
                )}

                {process.env.NODE_ENV === "development" && (
                  <Link href={`/dev`}>
                    <button
                      className="bg-white text-gray-700 active:bg-gray-50 text-xs font-bold uppercase px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none lg:mr-1 lg:mb-0 ml-3 mb-3 ease-linear transition-all duration-150 flex items-center"
                      type="button"
                    >
                      <svg
                        width="24"
                        height="24"
                        fillRule="evenodd"
                        clipRule="evenodd"
                      >
                        <path d="M13.033 2v-2l10 3v18l-10 3v-2h-9v-7h1v6h8v-18h-8v7h-1v-8h9zm1 20.656l8-2.4v-16.512l-8-2.4v21.312zm-3.947-10.656l-3.293-3.293.707-.707 4.5 4.5-4.5 4.5-.707-.707 3.293-3.293h-9.053v-1h9.053z" />
                      </svg>
                      <span className="ml-3">Developer Portal</span>
                    </button>
                  </Link>
                )}
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  );
}
