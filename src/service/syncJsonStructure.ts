import _ from 'lodash';

export function syncJsonStructure(oldJson: any, newJson: any) {
  const merged = _.cloneDeep(oldJson);

  function walk(newObj: any, oldObj: any) {
    for (const key in newObj) {
      if (typeof newObj[key] === 'object') {
        if (!oldObj[key]) {
          oldObj[key] = {};
        }
        walk(newObj[key], oldObj[key]);
      } else {
        oldObj[key] = 'value';
      }
    }
  }

  // Remove keys not present in newJson
  function prune(oldObj: any, newObj: any) {
    for (const key in oldObj) {
      if (!(key in newObj)) {
        delete oldObj[key];
      } else if (
        typeof oldObj[key] === 'object'
        && typeof newJson[key] === 'object'
      ) {
        prune(oldObj[key], newJson[key]);
      }
    }
  }

  walk(newJson, merged);
  prune(merged, newJson);

  return merged;
}
