import { BeginBar } from "../BeginBar/BeginBar";
import { BeginMenu } from "../BeginBar/BeginMenu";
import { ThankYouList } from "../BeginBar/ThankYouList";
import { AppWindows } from "../AppWindows/AppWindows";
import Link from "next/link";
// import {
//   removeOneWorkspace,
//   renameOneWorkspace,
// } from "@/src/pages/api/Workspace";
import moment from "moment";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useDeveloper } from "effectnode-developer-tools/effectnode-gui/store/useDeveloper";

export function EditorApp({ useStore }) {
  let router = useRouter();
  let spaceID = useStore((r) => r.spaceID);

  let [dateString, setDate] = useState(
    moment().format("MMMM Do YYYY, h:mm:ss a")
  );
  useEffect(() => {
    setInterval(() => {
      setDate(moment().format("MMMM Do YYYY, h:mm:ss a"));
    }, 1000);
  }, []);

  let rename = () => {
    let newTitle = window.prompt("Rename Workspace title", spaceID);
    if (newTitle) {
      useDeveloper
        .getState()
        .rename({
          oldTitle: spaceID,
          title: newTitle,
        })
        .then(() => {
          router.push(`/dev/projects/${newTitle}`);
        });
    }
  };

  return (
    <div className="w-full h-full">
      <div
        className="w-full from-gray-100 to-gray-500  bg-gradient-to-r"
        style={{ height: `1.85rem` }}
      >
        <div className="w-full h-full flex items-center justify-between px-2 text-sm">
          <div className="flex">
            <Link href={`/dev`} className="underline">
              EffectNode FX
            </Link>
            <span className="mx-2">|</span>

            <span
              className="underline text-blue-500 cursor-pointer inline-block"
              onClick={rename}
            >
              {spaceID}
            </span>
            <span
              className="text-xs ml-1 inline-block translate-y-1"
              onClick={rename}
            >
              {` 🖊️ `}
            </span>
          </div>
          <div className=""></div>
          <div className="text-white">
            <span
              onClick={() => {
                //
                let confirm = window.prompt(
                  "To recycle workspace please type yes",
                  "no"
                );
                if (confirm === "yes") {
                  useDeveloper
                    .getState()
                    .recycle({ title: spaceID })
                    .then(() => {
                      router.push(`/dev`);
                    })
                    .catch(() => {
                      router.push(`/dev`);
                    });
                }
                //
              }}
              className=" mr-2 underline inline-block text-xs text-red-200 hover:text-red-500 hover:underline px-3 py-1 hover:bg-white rounded-2xl cursor-pointer"
            >
              Delete Workspace
            </span>
            <span>{dateString}</span>
          </div>
        </div>
      </div>
      {/*  */}
      <div
        className="w-full bg-white"
        style={{
          height: `calc(100% - 1.85rem - 1.85rem * 0.0 - 2.75rem)`,
        }}
      >
        <div className="w-full h-full relative">
          <AppWindows useStore={useStore}></AppWindows>
          <BeginMenu useStore={useStore}></BeginMenu>
          <ThankYouList useStore={useStore}></ThankYouList>
        </div>
      </div>
      <div
        className="w-full from-gray-100 to-gray-500 bg-gradient-to-l "
        style={{
          height: `2.75rem`,
          backgroundImage: `
    linear-gradient(
          90deg,
          #747474,
          #f3f3f3,
          #747474
   )       
          `,
        }}
      >
        <BeginBar useStore={useStore}></BeginBar>
      </div>
    </div>
  );
}

//

// Edge Version Advantage

//
