const axios = require('axios');

let AUTH_TOKEN = ''; //'eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJyZW1vYmplY3RzQHFxLmNvbSIsInNjb3BlcyI6WyJURU5BTlRfQURNSU4iXSwidXNlcklkIjoiYTQ0NTgwMTAtMGFmYi0xMWVjLTk0MjYtZDMwNWNjZmNiOWZjIiwiZmlyc3ROYW1lIjoi5Lyf5rCRIiwibGFzdE5hbWUiOiLmm7kiLCJlbmFibGVkIjp0cnVlLCJpc1B1YmxpYyI6ZmFsc2UsInRlbmFudElkIjoiYTQwNjU0MzAtMGFmYi0xMWVjLTk0MjYtZDMwNWNjZmNiOWZjIiwiY3VzdG9tZXJJZCI6IjEzODE0MDAwLTFkZDItMTFiMi04MDgwLTgwODA4MDgwODA4MCIsImlzcyI6InRoaW5nc2JvYXJkLmlvIiwiaWF0IjoxNjMyMzg0MTk2LCJleHAiOjE2MzIzOTMxOTZ9.ILrkBdFSKvXLBN8RlaDvFnhUjStQBDmilbdZ13lccHEBnM4WFPi_wD6-hhQF6NDAD8LnDtsd33TMzWii06gPQw';
let LAST_AUTH = new Date()

axios.defaults.baseURL = 'http://115.227.16.247:10707/';
axios.defaults.timeout = 10000;
axios.defaults.headers.post['Content-Type'] = 'application/json';

axios.interceptors.request.use(
  async function (config) {
    console.log('request url: ', config.url)

    if (config.url.indexOf('login') < 0) {
      if (!AUTH_TOKEN || (new Date().getTime() - LAST_AUTH.getTime()) / 60000 > 120)
        await login();
    }

    config.headers['X-Authorization'] = 'Bearer ' + AUTH_TOKEN;
    return config;

  }, function (err) {
    console.log('request error:', err)
  })

axios.interceptors.response.use(function (res) {
  let data = res.data;
  return data;
}, async function (err) {
  if (err) {
    console.log('response error', err)
    if (err.response && err.response.status === 401)
      AUTH_TOKEN = '';
  }
})

const tb_username = 'remobjects@qq.com';
const tb_password = 'hJ$E0H93jH';

let login_promise = null;

async function login() {
  if (!AUTH_TOKEN) {
    if (!login_promise) {
      login_promise = axios.post('api/auth/login', {
        "username": tb_username,
        "password": tb_password
      });
      login_promise.then(function (response) {
        console.log('login response', response);
        AUTH_TOKEN = response.token;
        LAST_AUTH = new Date();
        login_promise = null;
      }).catch(function (err) {
        login_promise = null;
        console.log('login error', err);
      })
    }
  }
  console.log('await login...')
  await login_promise;
  return AUTH_TOKEN;
}

async function rpc(deviceId, param) {
  return await axios.post(`api/rpc/oneway/${deviceId}`, param).then(function (data) {
    return data
  })
}

async function getDeviceTypes() {
  return await axios.get('api/device/types').then(function (data) {
    return data;
  });
}

function testLogin() {
  for (let i = 1; i < 11; i++) {
    console.log('test login', i)
    new Promise(async function (resolve, reject) {
      await login();
      resolve(AUTH_TOKEN);
    }).then(function (token) {
      console.log('login token', token);
    });
  }
}

// testLogin();
//
async function test() {
  let result;
  result = await getDeviceTypes();
  console.log(result);

  // result = await rpc('4fd760b0-1853-11ec-9618-5fc4fc9beaff', {
  //   method: 'turn',
  //   param: 1
  // });

  console.log(result);
}

test()


