"use strict"

const moment = require('moment');

const devices_lookup = {};

async function buildDeviceLookup() {
  const devices = await getAllDevice();
  for (let device of devices) {
    devices_lookup[device.code] = { room: device.room, type: device.type }
  }
  console.log('build devices_lookup: ', devices_lookup, devices)
}

function getSurgeryDB() {
  return strapi.connections.surgery;
}

async function getAllDevice() {
  const knex = getSurgeryDB();
  let device = await knex('device').select();
  return device;
}

async function getBackupCount() {
  const knex = strapi.connections.default;
  const result = await knex('device_data').count();
  return result[0]['count(*)'];
}

async function backupData(data) {
  const knex = strapi.connections.default;
  return await knex('device_data').insert(data);
}

async function saveData2(data) {
  try {
    const knex = getSurgeryDB();
    await knex('device_data').insert(data);
  } catch (err) {
    console.log(new Date(), 'saveData', err);
    return await backupData(data)
  }
}

async function saveData(data) {
  try {
    const knex = getSurgeryDB();
    const data2 = [];
    for (let item of data) {
      data2.push(transformData(item));
    }
    await knex('ssmz_yqdata').insert(data2);
  } catch (err) {
    console.log(new Date(), 'saveData', err);
    await backupData(data);
  }
}

function transformData(item) {
  return {
    jssj: item.record_time,
    xmdh: item.key,
    xmjg: item.value,
    pat_id: '',
    xh: 1,
    mxxh: '',
    yq: '',
    code: item.device_code,
    room: devices_lookup[item.device_code].room
  }
}

async function saveStatus(sender, status) {
  const knex = getSurgeryDB();
  return knex('device').update({
    status: status,
    status_time: moment().format('YYYY-MM-DD HH:mm:ss')
  }).where({code: sender})
    .orWhere({host: sender});
}

async function saveError(sender, err) {
  const knex = getSurgeryDB();
  return await knex('device').update({
    error: (err || "").substr(0, 100),
    error_time: moment().format('YYYY-MM-DD HH:mm:ss')
  }).where({code: sender})
}

async function transferDeviceData(ctx) {

  async function getData() {
    const knex = strapi.connections.default;
    return knex('device_data').limit(20).select();
  }

  async function remove(data) {
    const knex = strapi.connections.default;
    return knex('device_data').delete().where('id', 'in', data.map((item) => item.id));
  }

  async function transfer2(data) {
    const knex = getSurgeryDB();
    data = data.map((item) => {
      let temp = {...item};
      delete temp.id;
      return temp;
    });
    return await knex('device_data').insert(data);
  }

  async function transfer(data) {
    const knex = getSurgeryDB();
    data = data.map((item) => {
      console.log(item);
      return {
        jssj: item.record_time,
        xmdh: item.key,
        xmjg: item.value,
        pat_id: '',
        xh: 1,
        mxxh: '',
        yq: '',
        code: item.device_code,
        room: devices_lookup[item.device_code].room
      };
    });
    return await knex('ssmz_yqdata').insert(data);
  }

  let count = 0;
  let data = await getData();
  while (data.length > 0) {
    await transfer(data);
    await remove(data);
    count += data.length;
    data = await getData();
  }

  return count;
}

module.exports = {
  buildDeviceLookup,
  getSurgeryDB,
  getAllDevice,
  backupData,
  saveData,
  saveStatus,
  saveError,
  getBackupCount,
  transferDeviceData
}
