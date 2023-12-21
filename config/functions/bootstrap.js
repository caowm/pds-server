'use strict';

module.exports = async () => {
  // do your boostrap

  strapi.connections.surgery = require('knex')(strapi.config.get('server.surgery'));
  // console.log(strapi.connections.surgery);

  await strapi.services['device-surgery'].buildDeviceLookup();
  await strapi.services['device-client'].startAllDevice();
  await strapi.services['device-server'].start();

  require('../../lib/strapio').start({
    path: "/strapio",
    cors: { origin: "*", methods: ["GET", "POST"] },
  })
};
