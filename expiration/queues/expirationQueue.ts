import  Queue  from "bull";
import { ExpirationCompletePublisher } from "../src/events/publishers/expirationCompletPublish";
import { natsWrapper } from "../src/natsWrapper";

// interface para definir oq sera enviado no job pelo bull ao redis
interface Paylod {
    orderId: string;
}

// order:expiration = nome do canal no redis que sera armazenado o job
const expirationQueue = new Queue<Paylod>('order:expiration', {
    redis: {
// REDIS_HOST = nome do container dentro expiration-depl.yaml que contem o pod expiration-redis-srv 
        host: process.env.REDIS_HOST
    }
})

// processar o job que retornou do redis
expirationQueue.process(async(job) => {
    console.log('Publish an expiration:complete event for orderId', job.data.orderId)
    new ExpirationCompletePublisher(natsWrapper.client).publish({
        orderId: job.data.orderId
    })
})

export { expirationQueue }