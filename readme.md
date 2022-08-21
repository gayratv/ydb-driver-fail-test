# Тестирование ошибки работающего драйвера YDB.

### Описание проблемы

На VPS в Yandex Compute cloud запускается простой сервер express, который не трогается в течение длительного времени (к нему нет обращений)

Перед запуском сервера инициализируется драйвер YDB Serverless.

В период времени от 1 до 4 часов драйвер падает с ошибкой.

Ошибка выглядит так:

```
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
```

### Решение

В данном примере проблема решается путем перехвата необработанной ошибки через process.on.  Данное решение плохо тем, что невозможно в точности утверждать что ошибка вызвана именно драйвером YDB.

Также в документации Node говорится что такая обработка ошибки используется только для освобождения ресурсов и сброса данных из кеша.
