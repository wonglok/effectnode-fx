import Link from "next/link";
import { useEffect, useState } from "react";

export default function Demo() {
  let [workspaces, setWorkspace] = useState([]);

  useEffect(() => {
    let workspaces = loadThumb({});
    setWorkspace(workspaces);
  }, []);

  // console.log(workspaces);
  return (
    <>
      {/*  */}

      <div className="  fixed top-0 left-0 z-[10000]  w-full h-12 bg-gray-900 bg-opacity-100 text-white flex items-center pl-3 justify-between">
        <Link href={"/"} className="inline-flex items-center mr-3">
          <svg
            style={{ height: "30px" }}
            clipRule="evenodd"
            fillRule="evenodd"
            strokeLinejoin="round"
            strokeMiterlimit="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="white"
              d="m9.474 5.209s-4.501 4.505-6.254 6.259c-.147.146-.22.338-.22.53s.073.384.22.53c1.752 1.754 6.252 6.257 6.252 6.257.145.145.336.217.527.217.191-.001.383-.074.53-.221.293-.293.294-.766.004-1.057l-4.976-4.976h14.692c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-14.692l4.978-4.979c.289-.289.287-.761-.006-1.054-.147-.147-.339-.221-.53-.221-.191-.001-.38.071-.525.215z"
              fillRule="nonzero"
            />
          </svg>
        </Link>
        <span className="inline-flex ml-3">Home</span>
        <div className="mx-6"></div>
      </div>
      <div className="h-12"></div>

      <div className=" m-5">
        <div className="p-4 w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6  gap-4 w-full h-full">
            {workspaces.map((work) => {
              return <OneThumb key={work._id} data={work}></OneThumb>;
            })}
          </div>
        </div>
      </div>

      {/*  */}
    </>
  );
}

function loadThumb({}) {
  let output = [];

  let rr = require.context(
    "src/effectnode/projects",
    true,
    /\/assets\/(.*).(png|jpg|hdr|jpeg|glb|gltf|fbx|exr|mp4|task|wasm|webm|mov)$/,
    "sync"
  );

  let list = rr.keys();

  list.forEach((key) => {
    if (key.startsWith("./") && key.includes("thumb")) {
      let filePath = key.split("/assets")[1].toLowerCase();

      output.push({
        _id: key,
        files: {
          [filePath]: rr(key),
        },
        name: key.replace("./", "").split("/assets/")[0],
        file: rr(key),
      });
    }
  });

  return output;
}

function OneThumb({ data }) {
  //
  // console.log(data);
  //

  let thumb = (
    <img
      alt=""
      src={"/img/sakura.jpg"}
      className="w-full h-full object-cover"
    ></img>
  );

  let files = data.files;

  if (files["/thumb.png"]) {
    thumb = (
      <img
        alt="thumbnail project"
        src={files["/thumb.png"]}
        className="w-full h-full object-cover"
      ></img>
    );
  }
  if (files["/thumb.mov"]) {
    thumb = (
      <video
        playsInline
        muted
        autoPlay
        loop
        className="w-full h-full object-cover"
        src={files["/thumb.mov"]}
      ></video>
    );
  }
  if (files["/thumb.mp4"]) {
    thumb = (
      <video
        playsInline
        muted
        autoPlay
        loop
        className="w-full h-full object-cover"
        src={files["/thumb.mp4"]}
      ></video>
    );
  }
  if (files["/thumb.wemb"]) {
    thumb = (
      <video
        playsInline
        muted
        autoPlay
        loop
        className="w-full h-full object-cover"
        src={files["/thumb.wemb"]}
      ></video>
    );
  }

  return (
    <>
      <article className="inline-block cursor-default relative h-[400px] overflow-hidden rounded-lg shadow transition hover:shadow-lg">
        {thumb}

        <div className="absolute top-0  left-0 w-full h-full bg-gradient-to-t from-gray-900/60 to-gray-900/25"></div>

        <div className="absolute bottom-0 left-0 w-full ">
          <div className="p-4 sm:p-6">
            <a href="#" className="mb-2 inline-block">
              <h3 className="mt-0.5 text-lg text-white">
                {data.name || `My Title`}
              </h3>
            </a>

            {/* <span className="block text-xs text-white/90">
              Created: {moment(new Date(data.createdAt)).format("YYYY-M-D")}
            </span>

            <span className="block text-xs text-white/90 mb-3">
              Updated: {moment(new Date(data.updatedAt)).fromNow()}
            </span> */}

            {/*
                <p className="mt-2 line-clamp-3 text-sm/relaxed text-white/95 mb-3">
                  <textarea className=" bg-transparent w-full border border-white p-2 rounded-lg">
                    Lorem ipsum dolor sit amet, consectetur adipisicing elit.
                    Recusandae dolores, possimus pariatur animi temporibus nesciunt
                    praesentium dolore sed nulla ipsum eveniet corporis quidem,
                    mollitia itaque minus soluta, voluptates neque explicabo tempora
                    nisi culpa eius atque dignissimos. Molestias explicabo corporis
                    voluptatem?
                  </textarea>
                </p>
            */}

            <div className="text-right w-full">
              <Link href={`/demo/${data.name}`}>
                <button className="text-white/95 text-sm p-4 py-1 border border-white rounded-lg hover:bg-gray-800 transition-colors duration-300">
                  Enter
                </button>
              </Link>
            </div>
          </div>
        </div>
      </article>
    </>
  );
}
