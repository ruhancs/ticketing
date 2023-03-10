import mongoose from 'mongoose';
import { app } from './app';
import { natsWrapper } from './natsWrapper';
import { TicketCreatedListener } from './events/listeners/ticketCreatedListener';
import { TicketUpdatedListener } from './events/listeners/ticketUpdateListener';
import { ExpirationCompleteListener } from './events/listeners/expirationCompleteListener';
import { PaymentCreatedListener } from './events/listeners/paymentCreatedListener';

const start = async () => {
    // informar para o typescript que process.env.JWT_KEY caso nao exista tera um erro
    if(!process.env.JWT_KEY) {
        throw new Error('key not found! JWT_KEY must be defined')
    }

    if(!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be defined')
    }

    if(!process.env.NATS_CLIENT_ID) {
        throw new Error('NATS_CLIENT_ID must be defined')
    }
    
    if(!process.env.NATS_URL) {
        throw new Error('NATS_URL must be defined')
    }
    
    if(!process.env.NATS_CLUSTER_ID) {
        throw new Error('NATS_CLUSTER_ID must be defined')
    }

    try {

// clusterId vem de nats-depl.yaml no args: '-cid'
// clientId string aleatoria
// url é o service criado em nats-depl.yaml, metadata: name: nats-srv, port: 4222 
        await natsWrapper.connect(
            process.env.NATS_CLUSTER_ID,
            process.env.NATS_CLIENT_ID,
            process.env.NATS_URL)
        natsWrapper.client.on('close', () => {
            console.log('NATS connection closed' )
            process.exit();
            })
        process.on('SIGINT', () => natsWrapper.client.close())
        process.on('SIGTERM', () => natsWrapper.client.close())
        
        // para receber os eventos createTicketEvent e updateTicketEvent
        new TicketCreatedListener(natsWrapper.client).listen()
        new TicketUpdatedListener(natsWrapper.client).listen()
        new ExpirationCompleteListener(natsWrapper.client).listen()
        new PaymentCreatedListener(natsWrapper.client).listen()

        mongoose.set('strictQuery', false)
        // conecta ao mongo db criado no kubernets
        await mongoose.connect(process.env.MONGO_URI).then(con => {
            console.log('DB connection succesfully')
        })
    } catch(err) {
        console.error(err)
    }
    app.listen(3000, () => {
        console.log('Listening on port 3000 ...')
    })
}

start()