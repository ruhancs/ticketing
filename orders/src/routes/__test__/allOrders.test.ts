import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../../app';
import { Order } from '../../models/orderModel';
import { Ticket } from '../../models/ticketModel';

const buildTicket = async () => {
    const ticket =Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'nba',
        price: 200
    })
    await ticket.save()

    return ticket;

}

it('fetches orders for an particular user',async () => {
    const ticket1 = await buildTicket()
    const ticket2 = await buildTicket()
    const ticket3 = await buildTicket()

    const user1 = global.signin()
    const user2 = global.signin()

    await request(app)
        .post('/api/orders')
        .set('Cookie', user1)
        .send({ ticketId: ticket1.id })
        .expect(201)

    await request(app)
        .post('/api/orders')
        .set('Cookie', user2)
        .send({ ticketId: ticket2.id })
        .expect(201)

    await request(app)
        .post('/api/orders')
        .set('Cookie', user2)
        .send({ ticketId: ticket3.id })
        .expect(201)
    
        const response = await request(app)
            .get('/api/orders')
            .set('Cookie', user2)
            .expect(200)

})