import { Projects } from "effectnode-developer-tools/effectnode-gui/projects";
import { useEffect } from "react";

export default process.env.NODE_ENV === "development"
  ? Projects
  : function Page() {
      useEffect(() => {
        location.assign("/");
      }, []);
      return <></>;
    };
