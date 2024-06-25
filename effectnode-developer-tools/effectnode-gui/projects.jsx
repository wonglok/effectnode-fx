import { useEffect } from "react";
import { DashLayout } from "./layout/DashLayout";
import { useDeveloper } from "./store/useDeveloper";
import { PlusCard } from "./dash-projects/PlusCard";
import { OneCard } from "./dash-projects/OneCard";

export function Projects() {
  let realodWorkspaces = () => {
    useDeveloper.getState().listAll();
  };
  useEffect(() => {
    //

    realodWorkspaces();
  }, []);

  let workspaces = useDeveloper((r) => r.workspaces);

  return (
    <>
      <DashLayout title={"Projects"}>
        <div
          style={{ minHeight: `calc(100vh - 120px)`, overflowY: "scroll" }}
          className="p-4 w-full rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600"
        >
          <div className=" grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6  gap-4 w-full h-full">
            <PlusCard
              onReload={() => {
                realodWorkspaces();
              }}
            ></PlusCard>

            {workspaces.map((work) => {
              return <OneCard key={work._id} data={work}></OneCard>;
            })}
          </div>
        </div>
      </DashLayout>
    </>
  );
}
