import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

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

async function main() {
  await initDbLocal();
  await queryRun(driver);
}

main();
