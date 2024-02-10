import { Eureka } from 'eureka-js-client';
const eurekaHost = (process.env.EUREKA_CLIENT_SERVICEURL_DEFAULTZONE || process.env.eurekaIp);
const eurekaPort = 8761;
const hostName = (process.env.HOSTNAME || process.env.eurekaIp)
const ipAddr = process.env.eurekaIp;

export function registerWithEureka(appName: string, PORT: number | string) {
    const client = new Eureka({
    instance: {
      app: appName,
      instanceId: appName,
      hostName: hostName,
      ipAddr: ipAddr,
      port: {
        '$': PORT,
        '@enabled': true,
      },
      vipAddress: appName,
      dataCenterInfo: {
        '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
        name: 'MyOwn', 
      },
    },
    //retry 10 time for 3 minute 20 seconds. 
    eureka: {
      host: eurekaHost,
      port: eurekaPort,
      servicePath: '/eureka/apps/',
      maxRetries: 10,
      requestRetryDelay: 2000,
    },
  })

client.logger.level('debug')

client.start( (error: any) => {
    console.log(error || "payment-service registered")
});



function exitHandler(options: { cleanup: any; exit: any; }, exitCode: number) {
    if (options.cleanup) {
      console.log('"payment eureka')
    }
    if (exitCode || exitCode === 0) console.log(exitCode);
    if (options.exit) {
        client.stop();
    }
}

client.on('deregistered', () => {
    process.exit();
    console.log('after deregistered');
})

client.on('started', () => {
  console.log("eureka host  " + eurekaHost);
})

process.on('SIGINT', exitHandler.bind(null, {exit:true}));
}