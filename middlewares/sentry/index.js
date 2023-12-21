
// const Sentry = require('@sentry/node');
// Sentry.init({
//   dsn: 'https://<key>@sentry.io/<project>',
//   environment: strapi.config.environment,
// });

/*
  uers-permissions middleware 插入policies示例

// Public node modules.
const _ = require('lodash');

module.exports = strapi => {
  return {
    beforeInitialize() {
      strapi.config.middleware.load.before.unshift('users-permissions');
    },

    initialize() {
      _.forEach(strapi.admin.config.routes, value => {
        if (_.get(value.config, 'policies')) {
          value.config.policies.unshift('plugins::users-permissions.permissions');
        }
      });

      _.forEach(strapi.config.routes, value => {
        if (_.get(value.config, 'policies')) {
          value.config.policies.unshift('plugins::users-permissions.permissions');
        }
      });

      if (strapi.plugins) {
        _.forEach(strapi.plugins, plugin => {
          _.forEach(plugin.config.routes, value => {
            if (_.get(value.config, 'policies')) {
              value.config.policies.unshift('plugins::users-permissions.permissions');
            }
          });
        });
      }
    },
  };
};


 */

module.exports = strapi => {
  return {
    initialize() {


      strapi.app.use(async (ctx, next) => {
        // const start = Date.now();
        // await next();
        // const delta = Math.ceil(Date.now() - start);
        // console.log('response time', delta);
        try {
          await next();
          console.log('ctx.response', ctx.response)
          // 先middleware，后policy， 而ctx.request.route在policy中设置，故ctx.request.route只能在next之后调用
          // console.log('ctx.request.route', ctx.request.route.controller, ctx.request.route.plugin)
        } catch (error) {
          // Sentry.captureException(error);
          // throw error;
          return ctx.badRequest(error)
        }
      });
    },
  };
};
