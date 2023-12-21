const hl7 = require('../../../lib/hl7/index');
const moment = require('moment');
const _ = require('lodash');
const {
  saveData,
  saveStatus,
  saveError
} = require('./device-surgery');
const {dict} = require('./device-item');
const {emit} = require('../../../lib/strapio');

console.log('device-item', dict);

const handler = async (err, req, res) => {
  if (err) {
    console.error(moment().format(), err);
  } else {
    console.log(moment().format(), req.sender, res.socket.remoteAddress, 'data:\n', req.msg.log());
    // let patient_id = null;
    // let pid = req.msg.getSegment('PID');
    // if (pid) {
    //   patient_id = pid.getComponent(4, 1).toString();
    // }
    const data = [];
    const time = moment().format('YYYY-MM-DD HH:mm:ss');
    req.msg.getSegments("OBX").forEach(function (segment) {
      const key = segment.fields[2].value[0][1].toString();
      const value = segment.fields[4].value[0][0].toString();
      // 过滤重复数据
      if (value && dict[key] && !(_.find(data, {key: dict[key]}))) {
        data.push({
          record_time: time,
          device_code: req.sender,
          patient_id: null,
          key: dict[key],
          value: (dict[key] === '体温' ? (5.0 * (parseFloat(value) - 32.0) / 9.0).toFixed(1) : value)
        });
      } else {
        // console.log("Name: " + testName + ", Result: " + result);
      }
    })
    if (data.length > 0) {
      await strapi.services['device-surgery'].saveData(data);
      emit('device', 'data', {
        sender: req.sender,
        ip: res.socket.remoteAddress,
        data: data
      })
    }
    await strapi.services['device-surgery'].saveStatus(req.sender, 'data');
  }
}

const onconnect = async (socket) => {
  await strapi.services['device-surgery'].saveStatus(socket.remoteAddress, 'connected');
}

const onclose = async (socket) => {
  await strapi.services['device-surgery'].saveStatus(socket.remoteAddress, 'closed');
}

const server = new hl7.Server.createTcpServer({}, handler)

async function start() {
  server.start(4601, '', { onconnect, onclose });
  console.log('医疗设备网关启动成功，端口号：4601');
}


module.exports = {
  start,
}
