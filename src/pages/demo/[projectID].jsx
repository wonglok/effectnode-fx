import { EffectNode } from "effectnode-developer-tools/effectnode-runtime/EffectNode";
import Link from "next/link";
import { useRouter } from "next/router";

export default function Page() {
  let rotuer = useRouter();
  let query = rotuer.query || {};
  let projectID = query.projectID || "";
  return (
    <>
      {/*  */}
      {/*  */}
      {projectID && <EffectNode projectName={projectID}></EffectNode>}
      {/*  */}
      {/*  */}
      <div className=" fixed top-0 left-0 w-full h-12 bg-gray-900 bg-opacity-80 text-white flex items-center justify-between pl-3">
        <Link href={"/demo"} className="inline-flex items-center mr-3">
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
        <span className="inline-flex ml-3">{projectID}</span>
        <div>
          <Link href={"/demo"} className="inline-flex items-center mr-3">
            <svg
              width="24"
              height="24"
              xmlns="http://www.w3.org/2000/svg"
              fillRule="evenodd"
              clipRule="evenodd"
            >
              <path
                fill="white"
                d="M22 11.414v12.586h-20v-12.586l-1.293 1.293-.707-.707 12-12 12 12-.707.707-1.293-1.293zm-6 11.586h5v-12.586l-9-9-9 9v12.586h5v-9h8v9zm-1-7.889h-6v7.778h6v-7.778z"
              />
            </svg>
          </Link>
        </div>
      </div>
    </>
  );
}
