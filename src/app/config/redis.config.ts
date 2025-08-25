import { createClient } from 'redis';
import { envVars } from './env';

export const redisClient = createClient({
    username: envVars.REDIS_USERNAME,
    password: envVars.REDIS_PASSWORD,
    socket: {
        host: envVars.REDIS_HOST,
        port: Number(envVars.REDIS_PORT)
    },
    pingInterval : 1000
});

// eslint-disable-next-line no-console
redisClient.on('error', err => console.log('Redis Client Error', err));


export const connectRedis = async()=>{

    if (!redisClient.isOpen) {
        await redisClient.connect()
    }

    // await client.connect();

    // await client.set('foo', 'bar');
    // const result = await client.get('foo');
    // console.log(result)  // >>> bar
}