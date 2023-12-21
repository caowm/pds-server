
// ======================================================
// const express = require('express')
// const app = express()
//
// app.get('/', (req, res) => {
//   res.send('hello')
// });
//
// const server = app.listen(3000, () => console.log('server is ready'))


// ======================================================
// process.kill(1548, 'SIGKILL')
// process.kill(15008, 'SIGTERM')
// console.log(process.env)
//

// ======================================================
// const minimist = require('minimist')//
// const args =  process.argv.slice(2)
// console.log(args)
// console.log(minimist(args))


// ======================================================
// const doSomething = () => console.log('test')//
// const measureSomething = () => {
//   console.time('doSomething()')
//   doSomething()
//   console.timeEnd('doSomething()')
// }
// measureSomething()


// ======================================================
// const chalk = require('chalk')
//
// console.log(chalk.yellow('hello'))

// ======================================================
// const ProgressBar = require('progress')
// const bar = new ProgressBar(':bar', {total: 100})
// const timer = setInterval(() => {
//   bar.tick()
//   if (bar.complete) {
//     clearInterval(timer)
//   }
// }, 100)
// console.log('progressbar')



// ======================================================
// const bar = () => console.log('bar')
// const baz = () => console.log('baz')
//
// const foo = () => {
//   console.log('foo')
//   setTimeout(bar, 0)
//   new Promise((resolve, reject) => {
//     resolve('should be after baz, before bar')
//   }).then(data => console.log(data))
//   baz()
// }
//
// foo()

