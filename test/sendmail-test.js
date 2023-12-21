// const sendmail = require('sendmail')({
//   logger: {
//     debug: console.log,
//     info: console.info,
//     warn: console.warn,
//     error: console.error
//   },
//   silent: false,
//   dkim: { // Default: False
//     privateKey: fs.readFileSync('./dkim-private.pem', 'utf8'),
//     keySelector: 'mydomainkey'
//   },
//   devPort: 1025, // Default: False
//   devHost: 'localhost', // Default: localhost
//   smtpPort: 2525, // Default: 25
//   smtpHost: 'localhost' // Default: -1 - extra smtp host after resolveMX
// })

const sendmail = require('sendmail')();

sendmail({
  from: 'no-reply@strapi.com',
  to: 'remobjects@qq.com, caowm2007@163.com',
  subject: 'nodejs mail test',
  html: 'sendmail 邮件测试',
}, function(err, reply) {
  console.log(err && err.stack);
  console.dir(reply);
});




