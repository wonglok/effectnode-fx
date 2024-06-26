import moment from "moment";
import Link from "next/link";
export function OneCard({ data }) {
  //
  // console.log(data);
  //

  return (
    <>
      <article className="inline-block cursor-default relative h-[400px] overflow-hidden rounded-lg shadow transition hover:shadow-lg">
        <img
          alt=""
          src="/img/sakura.jpg"
          className="w-full h-full object-cover"
        ></img>

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
