module.exports = {
  settings: {
    gzip: {
      enabled: false,
      options: {
        br: false
      }
    },
    sentry: {
      enabled: true,
      after: ['*']
    },
  }
};
