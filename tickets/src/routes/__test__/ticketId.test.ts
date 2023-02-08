import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticketsModel';
import mongoose from 'mongoose';


it('return 404 if the ticket not found', async() => {
    // gerar id valido que nao existe
    const id = new mongoose.Types.ObjectId().toHexString();
    
    await request(app)
        .get(`/api/tickets/${id}`)
        .send()
        .expect(404)
})

it('return the ticket if the ticket found', async() => {
    const response = await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'test',
            price: 20
        })
        expect(201)
    
    const ticketResponse = await request(app)
        .get(`/api/tickets/${response.body.userId}`)
        .send()
        expect(200)
    // expect(ticketResponse.body.title).toEqual('test')
    // expect(ticketResponse.body.price).toEqual(20)
})

