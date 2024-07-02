import Navbar from "@/components/UIKit/Navbars/AuthNavbar.js";
import Footer from "@/components/UIKit/Footers/Footer.js";
import { Canvas } from "@react-three/fiber";
import { FastFlameCompo } from "src/components/FastFlame/FastFlameCompo";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import {
  faCubes,
  faEarthAsia,
  faInbox,
  faPerson,
  faPhone,
  faPhoneAlt,
  faTimeline,
  faTimesCircle,
  faUserTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Box, Gltf, PerspectiveCamera, Stage } from "@react-three/drei";
// import { FastClothCompo } from 'src/components/FastCloth/FastClothCompo'
import { EnergyArtCompo } from "src/components/EnergyArt/EnergyArtCompo";

// import { LandingWater } from "@/components/UIKit/App/World/LandingSea"
// import { Protect } from "@/components/Protect/Protect"
import Link from "next/link";
import { EffectNode } from "effectnode-developer-tools/effectnode-runtime/EffectNode";

// export function PageOld() {
//     return (
//         <>
//             <div className="p-4 lg:p-12 h-full w-full">
//                 <div>
//                     <div>Campus App</div>
//                     <div className="mb-3">
//                         <Link href={`/auth`}>Login / Register</Link>
//                     </div>
//                 </div>

//                 <Protect noRedirect>
//                     <div className=" text-2xl mb-3">
//                         Welcome Back!
//                     </div>

//                     <div>
//                         <Link className="ml-3 list-item list-disc underline text-blue-500" href={`/world/dock`}>Dock</Link>
//                     </div>

//                     <div>
//                         <Link className="ml-3 list-item list-disc underline text-blue-500" href={`/world/sea`}>Sea</Link>
//                     </div>

//                     <div>
//                         <Link className="ml-3 list-item list-disc underline text-blue-500" href={`/world/forest`}>Forest</Link>
//                     </div>
//                 </Protect>
//             </div>
//         </>
//     )
// }

// //
// //
// //

export default function Landing() {
  return (
    <>
      <Navbar transparent={false} />

      <main>
        <div className="relative flex min-h-screen-75 content-center items-center justify-center pb-32 pt-16">
          <div
            className=" absolute top-0 size-full bg-cover bg-center"
            style={
              {
                //
                // backgroundImage:
                //     "url('/landing/hero.png')",
              }
            }
          >
            <span className="absolute inset-0 size-full bg-black opacity-100"></span>

            <span className="absolute inset-0 size-full">
              {/* <Canvas className="absolute left-0 top-0 size-full">
                <FastFlameCompo></FastFlameCompo>
                <EffectComposer enableNormalPass={false}>
                  <Bloom
                    intensity={5}
                    luminanceThreshold={0.15}
                    mipmapBlur={true}
                  ></Bloom>
                </EffectComposer>
              </Canvas> */}
              <div className="absolute left-0 top-0 size-full">
                <EffectNode projectName={"spikes-webgl"}></EffectNode>
              </div>
            </span>

            {/* <span className="absolute inset-0 size-full bg-black opacity-20"></span> */}
          </div>
          <div className="container relative mx-auto pointer-events-none">
            <div className="flex flex-wrap items-center">
              <div className="mx-auto w-full px-4 text-center lg:w-6/12">
                <div className="pr-12">
                  <h1 className="text-5xl font-semibold text-white">{`Effect Node FX`}</h1>
                  <p className="mt-4 text-lg text-gray-200">{`WebGPU + WebGL`}</p>
                </div>
              </div>
            </div>
          </div>
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 top-auto h-16 w-full overflow-hidden"
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
                className="fill-current text-gray-200"
                points="2560 0 2560 100 0 100"
              ></polygon>
            </svg>
          </div>
        </div>

        {false && (
          <section className="-mt-24 bg-gray-200 pb-20">
            <div className="container mx-auto px-4">
              <div className="flex flex-wrap">
                <div className="w-full px-4 pt-6 text-center md:w-4/12 lg:pt-12">
                  <div className="relative mb-8 flex w-full min-w-0 flex-col break-words rounded-lg bg-white shadow-lg">
                    <div className="flex-auto px-4 py-5">
                      <div className="mb-5 inline-flex size-12 items-center justify-center rounded-full bg-red-400 p-3 text-center text-white shadow-lg">
                        <i className="fas fa-award"></i>
                      </div>
                      <h6 className="text-xl font-semibold">Cross Site</h6>
                      <p className="mb-4 mt-2 text-gray-500">
                        What if chat can work like email? What if you can send a
                        message to a user on another site?
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full px-4 text-center md:w-4/12">
                  <div className="relative mb-8 flex w-full min-w-0 flex-col break-words rounded-lg bg-white shadow-lg">
                    <div className="flex-auto px-4 py-5">
                      <div className="mb-5 inline-flex size-12 items-center justify-center rounded-full bg-blue-400 p-3 text-center text-white shadow-lg">
                        <i className="fas fa-retweet"></i>
                      </div>
                      <h6 className="text-xl font-semibold">Better Privacy</h6>
                      <p className="mb-4 mt-2 text-gray-500">
                        What if you can keep your messages locally like all your
                        emails?
                      </p>
                    </div>
                  </div>
                </div>

                <div className="w-full px-4 pt-6 text-center md:w-4/12">
                  <div className="relative mb-8 flex w-full min-w-0 flex-col break-words rounded-lg bg-white shadow-lg">
                    <div className="flex-auto px-4 py-5">
                      <div className="mb-5 inline-flex size-12 items-center justify-center rounded-full bg-emerald-400 p-3 text-center text-white shadow-lg">
                        <i className="fas fa-fingerprint"></i>
                      </div>
                      <h6 className="text-xl font-semibold">Better Controls</h6>
                      <p className="mb-4 mt-2 text-gray-500">
                        Write a few lines about each one. A paragraph describing
                        a feature will be enough. Keep you user engaged!
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {
                <div className="mt-32 flex flex-wrap items-center">
                  <div className="mx-auto w-full px-4 md:w-5/12">
                    <div className="mb-6 inline-flex size-16 items-center justify-center rounded-full bg-white p-3 text-center text-gray-500 shadow-lg">
                      <i className="fas fa-user-friends text-xl"></i>
                    </div>
                    <h3 className="mb-2 text-3xl font-semibold leading-normal">
                      Working with us is a pleasure
                    </h3>
                    <p className="my-4 text-lg font-light leading-relaxed text-gray-600">
                      {`Don't let your uses guess by attaching tooltips and popoves to any element. Just
                                    make sure you enable them first via JavaScript.`}
                    </p>
                    <p className="mb-4 mt-0 text-lg font-light leading-relaxed text-gray-600">
                      {`The kit comes with three pre-built pages to help you get started faster. You can
                                    change the text and images and you're good to go. Just make sure you enable them
                                    first via JavaScript.`}
                    </p>
                    <Link href="/">
                      <span
                        href="#pablo"
                        className="mt-8 font-bold text-gray-700"
                      >
                        Check Notus NextJS!
                      </span>
                    </Link>
                  </div>

                  <div className="mx-auto w-full px-4 md:w-4/12">
                    <div className="relative mb-6 flex w-full min-w-0 flex-col break-words rounded-lg bg-gray-700 shadow-lg">
                      <img
                        alt="..."
                        src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1051&q=80"
                        className="w-full rounded-t-lg align-middle"
                      />
                      <blockquote className="relative mb-4 p-8">
                        <svg
                          preserveAspectRatio="none"
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 583 95"
                          className="absolute -top-94-px left-0 block h-95-px w-full"
                        >
                          <polygon
                            points="-30,95 583,95 583,65"
                            className="fill-current text-gray-700"
                          ></polygon>
                        </svg>
                        <h4 className="text-xl font-bold text-white">
                          Top Notch Services
                        </h4>
                        <p className="text-md mt-2 font-light text-white">
                          The Arctic Ocean freezes every winter and much of the
                          sea-ice then thaws every summer, and that process will
                          continue whatever happens.
                        </p>
                      </blockquote>
                    </div>
                  </div>
                </div>
              }
            </div>
          </section>
        )}

        {
          <section className="relative py-24 pb-32">
            <div
              className="pointer-events-none absolute inset-x-0 bottom-auto top-0 -mt-20 h-20 w-full overflow-hidden"
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
                  className="fill-current text-white"
                  points="2560 0 2560 100 0 100"
                ></polygon>
              </svg>
            </div>

            <div className="container mx-auto px-4">
              <div className="flex flex-wrap items-center">
                <div className="mx-auto w-full px-4 md:w-4/12">
                  <div className=" size-96 relative w-full">
                    <EffectNode
                      projectName={"examples-0001-webgpu-components"}
                    ></EffectNode>
                    {/* <Canvas className="absolute left-0 top-0 size-full bg-gray-900">
                      <FastFlameCompo></FastFlameCompo>
                      <EffectComposer enableNormalPass={false}>
                        <Bloom
                          intensity={5}
                          luminanceThreshold={0.15}
                          mipmapBlur={true}
                        ></Bloom>
                      </EffectComposer>
                    </Canvas> */}
                    {false && (
                      <Canvas className=" rounded-lg shadow-lg">
                        <color attach="background" args={["#000000"]}></color>
                        {/* <FastClothCompo></FastClothCompo> */}
                        <PerspectiveCamera
                          makeDefault
                          position={[0, 0, 150]}
                        ></PerspectiveCamera>
                        <EnergyArtCompo></EnergyArtCompo>
                        <EffectComposer
                          multisampling={0}
                          enableNormalPass={false}
                        >
                          <Bloom
                            intensity={0.25}
                            luminanceThreshold={0.15}
                            mipmapBlur={true}
                          ></Bloom>
                        </EffectComposer>
                      </Canvas>
                    )}
                  </div>
                </div>
                {true && (
                  <div className="mx-auto w-full px-4 md:w-5/12">
                    <div className="md:pr-12">
                      <div className="mb-6 inline-flex size-16 items-center justify-center rounded-full bg-gray-200 p-3 text-center text-gray-500 shadow-lg">
                        <FontAwesomeIcon
                          className="size-6"
                          icon={faPerson}
                        ></FontAwesomeIcon>
                      </div>
                      <h3 className="text-3xl font-semibold">EffectNode FX</h3>
                      <p className="mt-4 text-lg leading-relaxed text-gray-500">
                        {`Effect node is a javascript creative coder tooling software.`}
                      </p>
                      {true && (
                        <ul className="mt-6 list-none">
                          <li className="py-2">
                            <div className="flex items-center">
                              <div>
                                <span className="mr-3 inline-block rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold uppercase text-gray-500">
                                  <i className="fas fa-fingerprint"></i>
                                </span>
                              </div>
                              <div>
                                <h4 className="text-gray-500">3D World</h4>
                              </div>
                            </div>
                          </li>
                          <li className="py-2">
                            <div className="flex items-center">
                              <div>
                                <span className="mr-3 inline-block rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold uppercase text-gray-500">
                                  <i className="fab fa-html5"></i>
                                </span>
                              </div>
                              <div>
                                <h4 className="text-gray-500">
                                  Creative Coding
                                </h4>
                              </div>
                            </div>
                          </li>
                          <li className="py-2">
                            <div className="flex items-center">
                              <div>
                                <span className="mr-3 inline-block rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold uppercase text-gray-500">
                                  <i className="fab fa-html5"></i>
                                </span>
                              </div>
                              <div>
                                <h4 className="text-gray-500">3D WebSites</h4>
                              </div>
                            </div>
                          </li>
                        </ul>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        }

        {false && (
          <section className=" bg-gray-200 pb-48 pt-20">
            <div className="container mx-auto px-4">
              <div className="mb-24 flex flex-wrap justify-center text-center">
                <div className="w-full px-4 lg:w-6/12">
                  <h2 className="text-4xl font-semibold">
                    Here are our heroes
                  </h2>
                  <p className="m-4 text-lg leading-relaxed text-gray-500">
                    According to the National Oceanic and Atmospheric
                    Administration, Ted, Scambos, NSIDClead scentist, puts the
                    potentially record maximum.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap">
                <div className="mb-12 w-full px-4 md:w-6/12 lg:mb-0 lg:w-3/12">
                  <div className="px-6">
                    <img
                      alt="..."
                      src="/img/team-1-800x800.jpg"
                      className="mx-auto max-w-120-px rounded-full shadow-lg"
                    />
                    <div className="pt-6 text-center">
                      <h5 className="text-xl font-bold">Ryan Tompson</h5>
                      <p className="mt-1 text-sm font-semibold uppercase text-gray-400">
                        Web Developer
                      </p>
                      <div className="mt-6">
                        <button
                          className="mb-1 mr-1 size-8 rounded-full bg-blue-400 text-white outline-none focus:outline-none"
                          type="button"
                        >
                          <i className="fab fa-twitter"></i>
                        </button>
                        <button
                          className="mb-1 mr-1 size-8 rounded-full bg-blue-600 text-white outline-none focus:outline-none"
                          type="button"
                        >
                          <i className="fab fa-facebook-f"></i>
                        </button>
                        <button
                          className="mb-1 mr-1 size-8 rounded-full bg-pink-500 text-white outline-none focus:outline-none"
                          type="button"
                        >
                          <i className="fab fa-dribbble"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mb-12 w-full px-4 md:w-6/12 lg:mb-0 lg:w-3/12">
                  <div className="px-6">
                    <img
                      alt="..."
                      src="/img/team-2-800x800.jpg"
                      className="mx-auto max-w-120-px rounded-full shadow-lg"
                    />
                    <div className="pt-6 text-center">
                      <h5 className="text-xl font-bold">Romina Hadid</h5>
                      <p className="mt-1 text-sm font-semibold uppercase text-gray-400">
                        Marketing Specialist
                      </p>
                      <div className="mt-6">
                        <button
                          className="mb-1 mr-1 size-8 rounded-full bg-red-600 text-white outline-none focus:outline-none"
                          type="button"
                        >
                          <i className="fab fa-google"></i>
                        </button>
                        <button
                          className="mb-1 mr-1 size-8 rounded-full bg-blue-600 text-white outline-none focus:outline-none"
                          type="button"
                        >
                          <i className="fab fa-facebook-f"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mb-12 w-full px-4 md:w-6/12 lg:mb-0 lg:w-3/12">
                  <div className="px-6">
                    <img
                      alt="..."
                      src="/img/team-3-800x800.jpg"
                      className="mx-auto max-w-120-px rounded-full shadow-lg"
                    />
                    <div className="pt-6 text-center">
                      <h5 className="text-xl font-bold">Alexa Smith</h5>
                      <p className="mt-1 text-sm font-semibold uppercase text-gray-400">
                        UI/UX Designer
                      </p>
                      <div className="mt-6">
                        <button
                          className="mb-1 mr-1 size-8 rounded-full bg-red-600 text-white outline-none focus:outline-none"
                          type="button"
                        >
                          <i className="fab fa-google"></i>
                        </button>
                        <button
                          className="mb-1 mr-1 size-8 rounded-full bg-blue-400 text-white outline-none focus:outline-none"
                          type="button"
                        >
                          <i className="fab fa-twitter"></i>
                        </button>
                        <button
                          className="mb-1 mr-1 size-8 rounded-full bg-gray-700 text-white outline-none focus:outline-none"
                          type="button"
                        >
                          <i className="fab fa-instagram"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mb-12 w-full px-4 md:w-6/12 lg:mb-0 lg:w-3/12">
                  <div className="px-6">
                    <img
                      alt="..."
                      src="/img/team-4-470x470.png"
                      className="mx-auto max-w-120-px rounded-full shadow-lg"
                    />
                    <div className="pt-6 text-center">
                      <h5 className="text-xl font-bold">Jenna Kardi</h5>
                      <p className="mt-1 text-sm font-semibold uppercase text-gray-400">
                        Founder and CEO
                      </p>
                      <div className="mt-6">
                        <button
                          className="mb-1 mr-1 size-8 rounded-full bg-pink-500 text-white outline-none focus:outline-none"
                          type="button"
                        >
                          <i className="fab fa-dribbble"></i>
                        </button>
                        <button
                          className="mb-1 mr-1 size-8 rounded-full bg-red-600 text-white outline-none focus:outline-none"
                          type="button"
                        >
                          <i className="fab fa-google"></i>
                        </button>
                        <button
                          className="mb-1 mr-1 size-8 rounded-full bg-blue-400 text-white outline-none focus:outline-none"
                          type="button"
                        >
                          <i className="fab fa-twitter"></i>
                        </button>
                        <button
                          className="mb-1 mr-1 size-8 rounded-full bg-gray-700 text-white outline-none focus:outline-none"
                          type="button"
                        >
                          <i className="fab fa-instagram"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {false && (
          <section className="relative block bg-gray-800 py-20">
            <div
              className="pointer-events-none absolute inset-x-0 bottom-auto top-0 -mt-20 h-20 w-full overflow-hidden"
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
                  className="fill-current text-gray-800"
                  points="2560 0 2560 100 0 100"
                ></polygon>
              </svg>
            </div>

            <div className="container mx-auto px-4 lg:pb-64 lg:pt-24">
              <div className="flex flex-wrap justify-center text-center">
                <div className="w-full px-4 lg:w-6/12">
                  <h2 className="text-4xl font-semibold text-white">{`Vision`}</h2>
                  <p className="my-4 text-lg leading-relaxed text-gray-400">
                    {`Let's make the internet more inter-connected...`}
                  </p>
                </div>
              </div>
              <div className="mt-12 flex flex-wrap justify-center">
                <div className="w-full px-4 text-center lg:w-3/12">
                  <div className="inline-flex size-12 items-center justify-center rounded-full bg-white p-3 text-gray-800 shadow-lg">
                    <FontAwesomeIcon
                      className="size-6"
                      icon={faCubes}
                    ></FontAwesomeIcon>
                  </div>
                  <h6 className="mt-5 text-xl font-semibold text-white">3D</h6>
                  <p className="mb-4 mt-2 text-gray-400">
                    {`WebGL has alwasys been an fascinating technology to Lok.`}
                  </p>
                </div>
                <div className="w-full px-4 text-center lg:w-3/12">
                  <div className="inline-flex size-12 items-center justify-center rounded-full bg-white p-3 text-gray-800 shadow-lg">
                    <FontAwesomeIcon
                      className="size-6"
                      icon={faEarthAsia}
                    ></FontAwesomeIcon>
                  </div>
                  <h5 className="mt-5 text-xl font-semibold text-white">AI</h5>
                  <p className="mb-4 mt-2 text-gray-400">
                    {`AI like the movie called "her".... to help you do things on the internet.`}
                  </p>
                </div>
                <div className="w-full px-4 text-center lg:w-3/12">
                  <div className="inline-flex size-12 items-center justify-center rounded-full bg-white p-3 text-gray-800 shadow-lg">
                    <FontAwesomeIcon
                      className="size-6"
                      icon={faInbox}
                    ></FontAwesomeIcon>
                  </div>
                  <h5 className="mt-5 text-xl font-semibold text-white">
                    HTTP / WS
                  </h5>
                  <p className="mb-4 mt-2 text-gray-400">
                    {`Realtime InterSite communication is the future of the web.`}
                  </p>
                </div>
              </div>
            </div>
          </section>
        )}
        {false && (
          <section
            className="relative block bg-gray-800 py-24 lg:pt-0"
            style={{
              transform: `translateY(-1px)`,
            }}
          >
            <div className="container mx-auto px-4">
              <div className="-mt-48 flex flex-wrap justify-center lg:-mt-64">
                <div className="w-full px-4 lg:w-6/12">
                  <div className="relative mb-6 flex w-full min-w-0 flex-col break-words rounded-lg bg-gray-200 shadow-lg">
                    <div className="flex-auto p-5 lg:p-10">
                      <h4 className="text-2xl font-semibold">
                        Want to work with us?
                      </h4>
                      <p className="mb-4 mt-1 leading-relaxed text-gray-500">
                        Complete this form and we will get back to you in 24
                        hours.
                      </p>
                      <div className="relative mb-3 mt-8 w-full">
                        <label
                          className="mb-2 block text-xs font-bold uppercase text-gray-600"
                          htmlFor="full-name"
                        >
                          Full Name
                        </label>
                        <input
                          type="text"
                          className="w-full rounded border-0 bg-white p-3 text-sm text-gray-600 shadow transition-all duration-150 ease-linear placeholder:text-gray-300 focus:outline-none focus:ring"
                          placeholder="Full Name"
                        />
                      </div>

                      <div className="relative mb-3 w-full">
                        <label
                          className="mb-2 block text-xs font-bold uppercase text-gray-600"
                          htmlFor="email"
                        >
                          Email
                        </label>
                        <input
                          type="email"
                          className="w-full rounded border-0 bg-white p-3 text-sm text-gray-600 shadow transition-all duration-150 ease-linear placeholder:text-gray-300 focus:outline-none focus:ring"
                          placeholder="Email"
                        />
                      </div>

                      <div className="relative mb-3 w-full">
                        <label
                          className="mb-2 block text-xs font-bold uppercase text-gray-600"
                          htmlFor="message"
                        >
                          Message
                        </label>
                        <textarea
                          rows="4"
                          cols="80"
                          className="w-full rounded border-0 bg-white p-3 text-sm text-gray-600 shadow placeholder:text-gray-300 focus:outline-none focus:ring"
                          placeholder="Type a message..."
                        />
                      </div>
                      <div className="mt-6 text-center">
                        <button
                          className="mb-1 mr-1 rounded bg-gray-800 px-6 py-3 text-sm font-bold uppercase text-white shadow outline-none transition-all duration-150 ease-linear hover:shadow-lg focus:outline-none active:bg-gray-600"
                          type="button"
                        >
                          Send Message
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
