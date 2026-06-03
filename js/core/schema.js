// VaultOS — © 2026 Shamikh Ahmed. Source-available. See LICENSE.
// Entity schema defaults and apply helper

const EntitySchema = {
  defaults: {
    id: null,
    type: '',
    createdAt: null,
    updatedAt: null,
    tags: [],
    linkedEntities: [],
    archived: false,
    favorite: false,
    version: 1,
    _audit: [],
  },

  apply(obj, type) {
    return {
      ...EntitySchema.defaults,
      ...obj,
      type: obj.type || type,
      id: obj.id || Math.random().toString(36).slice(2),
      createdAt: obj.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: obj.tags || [],
      linkedEntities: obj.linkedEntities || [],
      archived: obj.archived || false,
      favorite: obj.favorite || false,
      version: (obj.version || 0) + 1,
    };
  },
};
