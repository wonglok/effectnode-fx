import { EffectNode } from "effectnode-developer-tools/effectnode-runtime/EffectNode";

export function Previewer({ win, useStore }) {
  let spaceID = useStore((r) => r.spaceID);
  // let getState = useCallback(() => {
  //   return useStore.getState().editorAPI.exportBackup();
  // }, [useStore]);

  // let [state, setState] = useState(false);

  // useEffect(() => {
  //   return useStore.subscribe((now, before) => {
  //     if (now.settings !== before.settings) {
  //       //
  //       setState(getState());
  //       //
  //     }
  //   });
  // }, [useStore, getState]);

  //

  return (
    <>
      {/* {spaceID && (
        <AppRunner
          win={win}
          state={state}
          useStore={useStore}
          getState={getState}
          spaceID={spaceID}
        ></AppRunner>
      )} */}
      {/* {spaceID} */}

      {/*  */}

      <EffectNode useEditorStore={useStore} projectName={spaceID}></EffectNode>
    </>
  );
}

//

//
