'use strict';

const {parseMultipartData} = require("strapi-utils");

const _ = require('lodash');
const {sanitizeEntity} = require('strapi-utils');

const sanitizeUser = user =>
  sanitizeEntity(user, {
    model: strapi.query('user', 'users-permissions').model,
  });

module.exports = {
  // 屏蔽
  async addUser(ctx) {
    let entity;
    if (ctx.is('multipart')) {
      const {data, files} = parseMultipartData(ctx);
      entity = await strapi.services.user.create(data, {files});
    } else {
      entity = await strapi.services.user.create(ctx.request.body);
    }
    return sanitizeEntity(entity, {model: strapi.models.user});
  },

  async register(ctx) {
    if (!ctx.session.captcha || !ctx.request.body.captcha || (ctx.request.body.captcha.toLowerCase() !== ctx.session.captcha))
      return ctx.badRequest('captcha error')

    ctx.session.captcha = null;

    const advanced = await strapi
      .store({
        environment: '',
        type: 'plugin',
        name: 'users-permissions',
        key: 'advanced',
      })
      .get();

    const {email, username, password, avatar, orgname, corpname} = ctx.request.body;

    if (!email) return ctx.badRequest('missing.email');
    if (!username) return ctx.badRequest('missing.username');
    if (!password) return ctx.badRequest('missing.password');
    if (!orgname) return ctx.badRequest('missing.orgname');
    if (!corpname) return ctx.badRequest('missing.corpname');

    const userWithSameUsername = await strapi
      .query('user', 'users-permissions')
      .findOne({username});

    if (userWithSameUsername) {
      return ctx.badRequest('Username already taken.')
    }

    if (advanced.unique_email) {
      const userWithSameEmail = await strapi
        .query('user', 'users-permissions')
        .findOne({email: email.toLowerCase()});

      if (userWithSameEmail) {
        return ctx.badRequest('Email already taken.');
      }
    }

    const user = {
      email,
      username,
      password,
      avatar,
      provider: 'local',
    };

    user.email = user.email.toLowerCase();

    const defaultRole = await strapi
      .query('role', 'users-permissions')
      .findOne({type: 'director'}, []);

    user.role = defaultRole.id;

    try {
      const org = await strapi.query('org').create({name: orgname, grade: 1});
      const corp = await strapi.query('org').create({name: corpname, grade: 2, parent: org.id});
      user.org = org.id;
      const data = await strapi.plugins['users-permissions'].services.user.add(user);

      ctx.created(sanitizeUser(data));
    } catch (error) {
      ctx.badRequest(null, formatError(error));
    }
  },
};
