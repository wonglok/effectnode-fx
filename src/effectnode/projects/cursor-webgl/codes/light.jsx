import { CursorTrackerTail } from "src/components/CursorTrackerTail/CursorTrackerTail";
import { Mouse } from "src/components/CursorTrackerTail/Mouse";

export function ToolBox({}) {
  return <></>;
}

export function Runtime({ ui, useStore, io }) {
  let Insert3D = useStore((r) => r.Insert3D) || (() => null);

  return (
    <>
      <Insert3D>
        <pointLight
          position={[-1.5, 0.5, 1]}
          color={ui.pointLightColor}
          intensity={ui.intensity}
        ></pointLight>
        <Mouse></Mouse>
      </Insert3D>
    </>
  );
}

//

//

//
