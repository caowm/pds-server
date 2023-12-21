const { upperFirst } = require('lodash');


module.exports = {

  async query(ctx) {
    const table = ctx.params.table
    const year = parseInt(ctx.params.year)
    const month = parseInt(ctx.params.month)
    const result = await strapi.services['surgery-stat']['query' + upperFirst(table)](year, month, ctx.query)
    return result
  },

  async build(ctx) {
    const table = ctx.params.table
    const year = parseInt(ctx.params.year)
    const month = parseInt(ctx.params.month)
    const result = await strapi.services['surgery-stat']['build' + upperFirst(table)](year, month, ctx.query)
    return 'ok'
  }

}
