/*
 *
 * HomePage
 *
 */

import React, { memo, useCallback, useReducer, useRef, useState, useEffect } from 'react';
// import PropTypes from 'prop-types';
import pluginId from '../../pluginId';
import { Table, Button, Flex } from '@buffetjs/core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

import {
  PopUpWarning,
  useGlobalContext,
  generateFiltersFromSearch,
  generateSearchFromFilters,
  request,
  useQuery,
} from 'strapi-helper-plugin';

const io = require("socket.io-client");

const HomePage = () => {
  console.log('pluginId', pluginId);
  const headers = [
    {
      name: '手术室',
      value: 'room',
    },
    {
      name: '设备编码',
      value: 'code',
    },
    {
      name: '名称',
      value: 'name',
    },
    {
      name: '型号',
      value: 'type',
    },
    {
      name: 'IP',
      value: 'host',
    },
    {
      name: '端口',
      value: 'port',
    },
    {
      name: '状态',
      value: 'status',
    },
    {
      name: '状态时间',
      value: 'status_time',
    },
    {
      name: '最近错误',
      value: 'error',
    },
    {
      name: '错误时间',
      value: 'error_time',
    },
  ];

  const telemetryHeader = [
    {
      name: '设备编码',
      value: 'device_code',
    },
    {
      name: '时间',
      value: 'record_time',
    },
    {
      name: '项目',
      value: 'key',
    },
    {
      name: '值',
      value: 'value',
    }
  ];

  const Status = {
    connected: '已连接',
    closed: '已关闭',
    data: '通讯中'
  };

  const CustomRow = ({ row }) => {
    return (
      <tr>
        <td>
          <p>{row.room}</p>
        </td>
        <td>
          <p>{row.code}</p>
        </td>
        <td>
          <p>{row.name}</p>
        </td>
        <td>
          <p>{row.type}</p>
        </td>
        <td>
          <p>{row.host}</p>
        </td>
        <td>
          <p>{row.port}</p>
        </td>
        <td>
          <p>{Status[row.status] || '未知'}</p>
        </td>
        <td>
          <p>{row.status_time}</p>
        </td>
        <td>
          <p>{row.error}</p>
        </td>
        <td>
          <p>{row.error_time}</p>
        </td>
      </tr>
    );
  };

  const [rows, setRows] = useState([]);
  const [telemetry, setTelemetry] = useState([]);
  const [backupCount, setBackupCount] = useState(0);

  const fetchData = async () => {
    const data = await request(`/${pluginId}/getAllDevice`, {
      method: 'GET',
    });
    setRows(data);
  }

  const getBackupCount = async () => {
    const data = await request(`/${pluginId}/getBackupCount`, {
      method: 'GET',
    });
    setBackupCount(data);
  }

  const transferData = async () => {
    try {
      const data = await request(`/${pluginId}/transferDeviceData`, {
        method: 'GET',
      });
      console.log('transferData', transferData);
      strapi.notification.toggle({
        type: 'success',
        message: '传输数据量: ' + data,
      });
    } catch(err) {
      console.log(err);
      strapi.notification.toggle({
        type: 'warning',
        message: '传输发生错误',
      });
    }
    await getBackupCount();
  }

  const stopAllDevice = async () => {
    await request(`/${pluginId}/stopAllDevice`, {
      method: 'GET',
    });
    strapi.notification.toggle({
      type: 'success',
      message: '关闭完成',
    });
    await fetchData();
  }

  const startAllDevice = async () => {
    await request(`/${pluginId}/startAllDevice`, {
      method: 'GET',
    });
    strapi.notification.toggle({
      type: 'success',
      message: '重启完成',
    });
    await fetchData();
  }

  const createSocket = () => {

    const socket = io.connect("", {path: "/strapio"});

    socket.emit("subscribe", "device");

    let tel = []
    socket.on("data", (data) => {
      console.log("data:", data);
      tel = data.data.concat(tel);
      if (tel.length > 100) tel = tel.slice(0, 100);
      setTelemetry(tel);
    });

    socket.on('message', (msg) => {
      console.log('message', msg);
    })
  }

  useEffect(() => {
    console.log('fetchData');
    fetchData();
    getBackupCount();
    createSocket();
  }, []);

  return (
    <div style={{padding: '18px 30px'}}>
      <h1 style={{padding: '18px 30px'}}>医疗设备</h1>
      <Flex justifyContent='jusify-content' alignItems="normal">
        <h2 style={{padding: '10px 30px'}}>设备状态</h2>
        <div style={{padding: '12px 20px', display: ''}}>
          <div>未传输的数据量：{backupCount}</div>
        </div>
        <div>
          <Button color="primary" label="传输" onClick={transferData} />&nbsp;
          <Button color="primary" label="停止客户端" onClick={stopAllDevice} />&nbsp;
          <Button color="primary" label="重启客户端" onClick={startAllDevice} />&nbsp;
          <Button color="primary" label="刷新" onClick={fetchData} />&nbsp;
        </div>
      </Flex>
      <Table headers={headers} rows={rows} customRow={CustomRow}/>
      <h1 style={{padding: '18px 30px'}}>实时数据</h1>
      <Table headers={telemetryHeader} rows={telemetry}/>
    </div>
  );
};

export default memo(HomePage);
