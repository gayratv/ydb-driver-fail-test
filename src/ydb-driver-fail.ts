// тестирование на отваливание драйвера
// ts-node ./src/test/test_ydb-driver.ts

import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { Driver, getSACredentialsFromJson, IamAuthService } from 'ydb-sdk';
import { queryRun } from './query';

let driver: Driver;

async function initDbLocal() {
  console.log('Driver initializing...');
  const saKeyFile = process.env.SA_KEY_FILE;
  const saCredentials = getSACredentialsFromJson('./' + saKeyFile);
  const authService = new IamAuthService(saCredentials);
  driver = new Driver({
    endpoint: process.env.ENDPOINT,
    database: process.env.DATABASE,
    authService,
  });
  const timeout = 10000;
  if (!(await driver.ready(timeout))) {
    console.error(`Driver has not become ready in ${timeout}ms!`);
    process.exit(1);
  }
  console.log('driver initialization Done');
}

const app = express();
const port = process.env.PORT;

process.on('uncaughtException', async (err) => {
  console.log('Ошибка на верхнем уровне process.on');
  const err1: any = err;

  console.log(`err1.code  ${err1.code}`);
  console.log(err1.details, 'err1.details ');
  console.log('');
  console.log('Полная распечатка ошибки');
  console.log(err);

  if (err1.code === 14 && err1.details === 'Stream refused by server') {
    // проблема с YDB
    console.log('>>>>>>> Error YDB problem');
    /* await driver.destroy();
    console.log('call initDbLocal');
    await initDbLocal();
    return;*/
  }

  process.exit(1); //mandatory (as per the Node docs)
});

(async () => {
  await initDbLocal();
  // initDbLocalFail();
})();

console.log('== Start ===  ');

app.get('/', (_req, res) => {
  res.send(`Hello World! test app\n`);
});

app.get('/apptest', async (_req, res) => {
  console.log('/apptest');
  const data = await queryRun(driver);
  console.log(data);
  console.log('length : ', JSON.stringify(data).length);
  res.json(data);
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
  console.log(`Example app listening on port ${port}`);
});

/*
err1.code  14
err1.details  Stream refused by server

2022-08-03T20:32:48.869Z
Полная распечатка ошибки
Error: 14 UNAVAILABLE: Stream refused by server
    at Object.callErrorFromStatus (/var/www/makeupkitchen.ga/node/node_modules/@grpc/grpc-js/src/call.ts:81:17)
    at Object.onReceiveStatus (/var/www/makeupkitchen.ga/node/node_modules/@grpc/grpc-js/src/client.ts:352:36)
    at Object.onReceiveStatus (/var/www/makeupkitchen.ga/node/node_modules/@grpc/grpc-js/src/client-interceptors.ts:462:34)
    at Object.onReceiveStatus (/var/www/makeupkitchen.ga/node/node_modules/@grpc/grpc-js/src/client-interceptors.ts:424:48)
    at /var/www/makeupkitchen.ga/node/node_modules/@grpc/grpc-js/src/call-stream.ts:330:24
    at processTicksAndRejections (node:internal/process/task_queues:78:11)
for call at
    at Client.makeUnaryRequest (/var/www/makeupkitchen.ga/node/node_modules/@grpc/grpc-js/src/client.ts:324:26)
    at IamTokenService.rpcImpl (/var/www/makeupkitchen.ga/node/node_modules/ydb-sdk/build/cjs/utils.js:71:20)
    at IamTokenService.rpcCall (/var/www/makeupkitchen.ga/node/node_modules/protobufjs/src/rpc/service.js:94:21)
    at executor (/var/www/makeupkitchen.ga/node/node_modules/@protobufjs/aspromise/index.js:44:16)
    at new Promise (<anonymous>)
    at Object.asPromise (/var/www/makeupkitchen.ga/node/node_modules/@protobufjs/aspromise/index.js:28:12)
    at IamTokenService.rpcCall (/var/www/makeupkitchen.ga/node/node_modules/protobufjs/src/rpc/service.js:86:21)
    at IamTokenService.Create (/var/www/makeupkitchen.ga/node/node_modules/ydb-sdk-proto/proto/bundle.js:92967:37)
    at IamAuthService.sendTokenRequest (/var/www/makeupkitchen.ga/node/node_modules/ydb-sdk/build/cjs/credentials.js:88:39)
    at IamAuthService.updateToken (/var/www/makeupkitchen.ga/node/node_modules/ydb-sdk/build/cjs/credentials.js:92:41) {  code: 14,
  details: 'Stream refused by server',
  metadata: Metadata { internalRepr: Map(0) {}, options: {} }
}
 */
