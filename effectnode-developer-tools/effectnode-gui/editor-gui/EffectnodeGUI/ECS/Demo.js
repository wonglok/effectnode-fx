import { EntityService } from "./EntityService";

function Demo() {
  let entity1 = EntityService.getNewEntity({ _id: 1, isArmy: true });

  EntityService.addComponent(entity1, "renderable", () => {
    return mesh;
  });
  EntityService.addComponent(entity1, "actions", () => {
    return new Action();
  });
  EntityService.addComponent(entity1, "yoyo", () => {
    return {
      //
    };
  });

  /////////

  let entity2 = EntityService.getNewEntity({ _id: 2, isArmy: false });
  EntityService.addComponent(entity2, "renderable", () => {
    return new Mesh();
  });
  EntityService.addComponent(entity2, "actions", () => {
    return new Action();
  });
  EntityService.addComponent(entity2, "yoyo", () => {
    return {};
  });

  //////////

  let entity3 = EntityService.getNewEntity({ _id: 2, isArmy: false });
  EntityService.addComponent(entity3, "renderable", () => {
    return new Mesh();
  });
  EntityService.addComponent(entity3, "yoyo", () => {
    return {};
  });

  EntityService.filterNames(["renderable", "yoyo"]).forEach((entity) => {
    console.log(entity.getComponent("renderable"));
  });
}
