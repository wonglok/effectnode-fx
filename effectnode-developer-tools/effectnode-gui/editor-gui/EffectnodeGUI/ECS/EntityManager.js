const getID = () => "_" + Math.random().toString(36).slice(2, 9);

export class EntityManager {
  constructor() {
    this._array = [];
  }
  exportBackup() {
    //
    return JSON.parse(JSON.stringify(this._array));
  }
  restoreBackup(data) {
    this._array = JSON.parse(JSON.stringify(data));
  }
  getNewEntity(data = {}) {
    data = {
      //
      ...data,
      _storeMap: {},
      _id: getID(),
    };
    this.addObject(data);
    return data;
  }
  filterNames(classNames) {
    return this._array.filter((r) => {
      let hasAll = false;
      classNames.forEach((name) => {
        if (!!r._storeMap[name]) {
          hasAll = true;
        } else {
          hasAll = false;
        }
      });

      return hasAll;
    });
  }
  //
  //
  //
  addObject(object) {
    this._array.push(object);
  }
  removeObject(object) {
    let idx = this._array.indexOf((r) => r._id === object._id);
    this._array.slice(idx, 1);
  }
  findById(_id) {
    return this._array.find((r) => r._id === _id);
  }
  filter(fnc) {
    return this._array.filter(fnc);
  }
  map(fnc) {
    return this._array.map(fnc);
  }
  get list() {
    return this._array;
  }
  //
  //
  getComponent(self, className) {
    return self._storeMap[className];
  }
  hasComponent(self, className) {
    return !!self._storeMap[className];
  }
  addComponent(self, className, func) {
    let classObject = func({ entity: self });

    self._storeMap[className] = classObject;
  }
  removeComponent(self, className) {
    delete self._storeMap[className];
  }
}
