
const hl7 = require('../../../lib/hl7/index');
const delimiter = require('../../../lib/hl7/hl7/delimiters');
const moment = require('moment');
const _ = require('lodash');
const {
  getAllDevice,
  saveData,
  saveStatus,
  saveError} = require('./device-surgery');
const {dict} = require('./device-item');
const {emit} = require('../../../lib/strapio');

const heartMsg = `MSH|^~\\&|Mindray|PDSTest|||||ORU^R01|106|P|2.3.1`;

// 迈瑞监护仪PDS HL7协议， 适用设备： IPM系列 IMEC T系列
async function pds_onconnect(client) {
  console.log(moment().format(), client.id, client.host, 'connected');
  await strapi.services['device-surgery'].saveStatus(client.id, 'connected');
  // 连接后发送查询包
  const ts = moment().format('YYYYMMDDHHmmss');
  const id = 'LZQry8'; // ts.substr(8, 20);
  const queryMsg = `MSH|^~\\&|Mindray|PDSTest|||||QRY^R02|1203|P|2.3.1\rQRD|${ts}|R|I|${id}|||||RES\rQRF|MON||||0&0^1^1^0^${dict.t_serial_filters}\r`
  setTimeout(()=> {
    console.log('query:', queryMsg);
    client.send(queryMsg);
  }, 1000)

};

async function pds_onclose(client) {
  // console.log(moment().format(), client.id, client.host, 'closed');
  await strapi.services['device-surgery'].saveStatus(client.id, 'closed');
};

async function pds_ondata(err, client, msg) {
  if (err) {
    console.log(moment().format(), client.id, client.host, "error：", err.message || "未知错误");
    await strapi.services['device-surgery'].saveError(client.id, err.message || "未知错误")
  } else {
    // console.log(moment().format(), client.id, client.host, "data:\n", msg.log());
    // let patient_id = null;
    // let pid = msg.getSegment('PID');
    // if (pid) {
    //   patient_id = pid.getComponent(4, 1).toString();
    // }
    if (!client.data_timestamp) client.data_timestamp = {};
    const data = [];
    const time = moment().format('YYYY-MM-DD HH:mm:ss');
    msg.getSegments("OBX").forEach(function (segment) {
      if (segment.fields[1].toString() !== "NM") return;
      // const key = segment.fields[2].value[0][1].toString();
      const key = segment.fields[2].toString(delimiter);
      const value = segment.fields[4].value[0][0].toString();
      // 过滤重复数据
      if (key && value && dict[key] && !(_.find(data, {key: dict[key]}))) {
        // 用时间间隔过滤数据: 记录最小间隔20s
        if (client.data_timestamp[key] && moment().diff(client.data_timestamp[key]) < 20000 )
          return;
        client.data_timestamp[key] = moment();
        data.push({
          record_time: time,
          device_code: client.id,
          patient_id: null,
          key: dict[key],
          value: value
        });
      } else {
        // console.log("Name: " + testName + ", Result: " + result);
      }
    })
    if (data.length > 0) {
      console.log(moment().format(), client.id, client.host, "data:", msg.log());
      await strapi.services['device-surgery'].saveData(data);
      emit('device', 'data', {
        sender: client.id,
        ip: client.host,
        data: data
      });
    }
    await strapi.services['device-surgery'].saveStatus(client.id, 'data');
  }
}

function createClient(device) {
  return hl7.Server.createTcpClient({
    id: device.code,
    host: device.host,
    port: device.port,
    keepalive: true,
    heartTimeout: 3000,
    heartMsg: heartMsg,
    onConnect: pds_onconnect,
    onClose: pds_onclose,
    callback: pds_ondata,
  });
}

let active_device = [];

module.exports = {

  async stopAllDevice() {
    for(const device of active_device) {
      if (device.client) device.client.close();
    }
    active_device = [];
    return active_device.length;
  },

  async startAllDevice() {
    console.log(moment().format(), '重启设备连接...')
    await this.stopAllDevice();
    let devices = await strapi.services['device-surgery'].getAllDevice();

    for(const device of devices) {
      // 迈瑞T系列是被动式
      if (device.type !== 'MINDRAY_T-SERIES') continue;
      active_device.push(device);
      const client = createClient(device);
      if (!client) continue;
      device.client = client;
      client.connect();
    }

    return active_device.length;
  },

  async refreshDevice() {
    console.log(moment().format(), '刷新设备连接...');
    const new_device = await strapi.services['device-surgery'].getAllDevice();

    for (const device of new_device) {
      const temp = _.find(active_device, {code: device.code});
      if (!temp) {
        if (device.type !== 'MINDRAY_T-SERIES') continue;
        // 创建新设备
        active_device.push(device);
        device.client = createClient(device);
        if (device.client) device.client.connect();
      } else if (temp.type !== device.type || temp.host !== device.host || temp.port !== device.port) {
        // 更新设备连接
        if (temp.client) temp.client.close();
        if (device.type !== 'MINDRAY_T-SERIES') continue;
        temp.host = device.host;
        temp.port = device.port;
        temp.type = device.type;
        temp.name = device.name;
        temp.client = createClient(temp);
        if (temp.client) temp.client.connect();
      }
    }

    // 删除不存在的设备
    for (let i = active_device.length - 1; i >= 0; i--) {
      const temp = _.find(new_device, {code: active_device[i].code});
      if (!temp) {
        if (active_device[i].client)
          active_device[i].client.close();
        active_device.splice(i, 1);
      }
    }
  }

};
