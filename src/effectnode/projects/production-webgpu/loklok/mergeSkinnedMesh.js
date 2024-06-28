import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";
import * as BufferGeometryUtils from "three/examples/jsm/utils/BufferGeometryUtils";
import { SkinnedMesh } from "three";

export function mergeSkinnedMesh(root) {
  //Make a clone of the root.. to work with..
  let ud = root.userData;
  root.userData = {};
  let nroot = SkeletonUtils.clone(root);
  root.userData = nroot.userData = ud;

  //Find all the skinned meshes
  let meshes = [];
  nroot.traverse((e) => e && e.isMesh && meshes.push(e));

  //Find all the materials
  let matmap = new Map();
  meshes.forEach((m) => matmap.set(m.material, m.material));
  let mats = Array.from(matmap.values());
  console.log(mats);

  let texmap = new Map();
  let mapTypes = new Map();
  mats.forEach((m) => {
    for (let k in m) {
      if (!(k.endsWith("Map") || k == "map")) continue;
      if (m[k]) {
        texmap.set(m[k], m[k]);
        mapTypes.set(k, k);
      }
    }
  });
  mapTypes = Array.from(mapTypes.values());
  let textures = Array.from(texmap.values());

  //Make sure all the meshes have the same morphTargetsRelative setting.. or merging will fail..
  meshes.forEach((m) => {
    //        m.geometry.morphTargetAttributes={}
    m.geometry.morphTargetsRelative = false;
  });

  //Merge all the geometries into a single geometry....
  let geoms = meshes.map((e) => e.geometry);
  let mergedGeometry = BufferGeometryUtils.mergeGeometries(geoms, true);
  let smesh = new SkinnedMesh(
    mergedGeometry,
    meshes.map((e) => e.material)
  );

  //copy the skeleton to the new SkinnedMesh...
  smesh.skeleton = meshes[0].skeleton;
  meshes.forEach((m) => m.parent.remove(m)); //Remove the original meshes

  nroot.add(smesh); //Add the newly generated merged mesh...
  nroot.userData = ud; //copy the userdata from the original root
  return nroot;
}
