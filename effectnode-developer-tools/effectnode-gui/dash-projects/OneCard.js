import moment from "moment";
import Link from "next/link";
export function OneCard({ data }) {
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

  let files = loadThumb({ projectName: `${data.title}` });

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
                {data.title || `My Title`}
              </h3>
            </a>

            <span className="block text-xs text-white/90">
              Created: {moment(new Date(data.createdAt)).format("YYYY-M-D")}
            </span>

            <span className="block text-xs text-white/90 mb-3">
              Updated: {moment(new Date(data.updatedAt)).fromNow()}
            </span>

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
              <Link href={`/dev/projects/${data.title}`}>
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

export function loadThumb({ projectName }) {
  let output = {};

  let rr = require.context(
    "src/effectnode/projects",
    true,
    /\/assets\/(.*).(png|jpg|hdr|jpeg|glb|gltf|fbx|exr|mp4|task|wasm|webm|mov)$/,
    "sync"
  );

  let list = rr.keys();

  list.forEach((key) => {
    if (key.startsWith("./") && key.includes(`/${projectName}/`)) {
      let filePath = key.split("/assets")[1].toLowerCase();

      output[filePath] = rr(key);
    }
  });

  return output;
}
