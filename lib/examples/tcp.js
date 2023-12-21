var hl7 = require('../lib');
var moment = require('moment');

////////////////////SERVER///////////////////
var app = hl7.tcp();
app.use(function (req, res, next) {
  console.log('Message Recieved From ' + req.facility);
  console.log('Message Event: ' + req.event);
  console.log('Message Type: ' + req.type);
  next();
});

//create middleware
app.use(function (req, res, next) {
  //create middleware for certain message types
  if (req.type != 'ADT' || req.event != 'A04') {
    return next();
  }

  var pid = req.msg.getSegment('PID');
  var patient = pid.getComponent(5, 2) + ' ' + pid.getComponent(5, 1);

  console.log('Patient Info Is ' + patient);
  next();
});

//Send Ack
app.use(function (req, res, next) {
  console.log('************sending ack****************')
  res.end();
})

//Error Handler
app.use(function (err, req, res, next) {
  var msa = res.ack.getSegment('MSA');
  msa.setField(1, 'AR');
  res.ack.addSegment('ERR', err.message);
  res.end();
});


// app.start(7777);
// console.log('tcp interface listening on ' + 7777);
////////////////////SERVER///////////////////

var heartMsg = `MSH|^~\\&|||||||ORU^R01|106|P|2.3.1|`

////////////////////CLIENT///////////////////
var parser = new hl7.Parser({segmentSeperator: '\n'});
var client = hl7.Server.createTcpClient({
  host: '127.0.0.1',
  port: 7777,
  keepalive: true,
  heartTimeout: 10000,
  heartMsg: heartMsg,
  onConnect: onConnect,
  callback: processor_n12,
});

function onConnect(client) {
  console.log(new Date(), 'onConnect');
  const ts = moment().format('YYYYMMDDHHmmssSSS');
  const id = 'Q895211';
  const queryMsg =`MSH|^~\\&|||||||QRY^R02|1203|P|2.3.1\rQRD|${ts}|R|I|${id}|||||RES\rQRF|MON||||0&0^1^1^1^\r`
  client.send(queryMsg);
}


const dict = {
  "MDC_PULS_OXIM_PULS_RATE": "脉搏",
  "MDC_ECG_HEART_RATE": "心率",
  "MDC_TTHOR_RESP_RATE": "呼吸",
  "MDC_PRESS_CUFF_SYS": "收缩压ART",
  "MDC_PRESS_CUFF_DIA": "舒张压ART",
  "MDC_PRESS_BLD_ART_ABP_SYS": "动脉收缩压",
  "MDC_PRESS_BLD_ART_ABP_DIA": "动脉舒张压",
  "26_MDC_TEMP": "体温",
  "MDC_CONC_AWAY_CO2_ET": "呼末CO2"
}

function processor_n12(err, ack) {
  if (err) {
    console.log("*******ERROR********");
    console.log(err.message);
  } else {
    console.log("*******PACKAGE********");
    // console.log(ack.log());
    ack.getSegments("OBX").forEach(function(segment) {
      const testName = segment.fields[2].value[0][1].toString();
      const result = segment.fields[4].value[0][0].toString();
      if (dict[testName]) {
        console.log(dict[testName] + ": " + result);
      } else {
        console.log("Name: " + testName + ", Result: " + result);
      }
    })
  }
}
// console.log('client', client);
client.connect();

// var msg = parser.parseFileSync('test/samples/adt.hl7');

// console.log('************sending 1 message****************');
// client.send(msg);
//
// setTimeout(function() {
//   console.log('2');
//   console.log('************sending 2 message****************');
//   client.send(msg);
// }, 1000);
//
// setTimeout(function() {
//   console.log('************sending 3 message****************');
//   client.send(msg);
// }, 2000);


// setTimeout(function() {
//   client.close();
//   process.exit();
// }, 30000)

////////////////////CLIENT///////////////////

