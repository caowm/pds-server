'use strict';

/**
 * pds.js controller
 *
 * @description: A set of functions called "actions" of the `pds` plugin.
 */

module.exports = {

  index: async (ctx) => {
    ctx.send({
      message: 'ok'
    });
  },

  getAllDevice: async (ctx) => {
    return await strapi.services['device-surgery'].getAllDevice(ctx);
  },

  startAllDevice: async (ctx) => {
    return await strapi.services['device-client'].startAllDevice(ctx);
  },

  stopAllDevice: async (ctx) => {
    return await strapi.services['device-client'].stopAllDevice(ctx);
  },

  getBackupCount: async (ctx) => {
    return await strapi.services['device-surgery'].getBackupCount(ctx);
  },

  transferDeviceData: async (ctx) => {
    return await strapi.services['device-surgery'].transferDeviceData(ctx);
  },

};
