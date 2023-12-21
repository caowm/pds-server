const db = async (param) => {
  await new Promise((resolve => {
    console.log('db', param)
    for (let i = 0; i < Math.pow(10, param); i++) {

    }
    resolve('db', param)
    console.log('db end', param)
  }))
}

// 异步任务串行执行
let taskPromise = null;
const taskSync = async (param) => {
  if (taskPromise !== null) {
    console.log('await', param)
    await taskPromise
    // taskPromise.then(() => taskSync(param)).catch(() => taskSync(param))
    return taskSync(param)
  } else {
    taskPromise = new Promise((async (resolve, reject) => {
      console.log('task', param)
      let result = await db(param)
      console.log('db result', result)
      if ((param % 2) == 0) {
        resolve('resolve: ' + param)
      } else {
        reject('reject: ' + param)
      }
    })).then((data) => {
      taskPromise = null
      console.log(data)
    }).catch((err) => {
      taskPromise = null
      console.log('err', err)
    })
    return taskPromise
  }
}


const taskAsync = async (param) => {
  let promise = new Promise((async (resolve, reject) => {
    console.log('task', param)
    let result = await db(param)
    console.log('db result', result)
    if ((param % 2) >= 0) {
      resolve('resolve: ' + param)
    } else {
      reject('reject: ' + param)
    }
  })).then((data) => {
    console.log(data)
  }).catch((err) => {
    console.log('err', err)
  })
  return promise
}

async function testTask() {
  for (let i = 0; i < 6; i++) {
    let promise = new Promise(async (resolve) => {
      await taskAsync(i)
      resolve(i)
    })
    await promise
  }
}

// testTask()

new Promise(async (resolve) => {
  await taskAsync(3)
  resolve(3)
})

new Promise(async (resolve) => {
  await taskAsync(4)
  resolve(4)
})

new Promise(async (resolve) => {
  await taskAsync(5)
  resolve(5)
})
