// test ok.

const ADMIN_JWT_SECRET = '107b1b5ec535489c6e220b1637ae452f';

var jwt = require('jsonwebtoken');
var fs = require('fs');

// Synchronous Sign with default (HMAC SHA256)
var token = jwt.sign({foo: 'bar', role: 'admin'}, ADMIN_JWT_SECRET);
console.log(token);

// sign with RSA SHA256
// var privateKey = fs.readFileSync('private.key');
// token = jwt.sign({foo: 'bar'}, privateKey, {algorithm: 'RS256'});
// console.log(token);

// var token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiaWF0IjoxNjM1MTQ4ODc4LCJleHAiOjE2Mzc3NDA4Nzh9.smcnNyyG68RN-Wr3hRc0bwQRmueZwraxstg9RTZPxHs";

var decoded = jwt.verify(token, ADMIN_JWT_SECRET);
console.log(decoded);
