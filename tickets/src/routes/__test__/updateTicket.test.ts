import request from 'supertest';
import { app } from '../../app';
import mongoose from 'mongoose';
import { natsWrapper } from '../../natsWrapper';
import { Ticket } from '../../models/ticketsModel';

it('returns a 404 if the provided id does not exist', async () => {
    const id = new mongoose.Types.ObjectId().toHexString()

    await request(app)
        .put(`/api/tickets/${id}`)
        .set('Cookie', global.signin())
        .send({
            title:'title',
            price: 20
        })
        .expect(404)
})

it('returns a 401 if the user is not authenticated', async () => {
    const id = new mongoose.Types.ObjectId().toHexString()

    await request(app)
        .put(`/api/tickets/${id}`)
        .send({
            title:'title',
            price: 20
        })
        .expect(401)   
})

it('returns a 401 if the user does not own ticket', async () => {
    const response = await request(app)
        .post(`/api/tickets`)
        .set('Cookie', global.signin())
        .send({
            title:'title',
            price: 20
        })
    
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie',global.signin())
        .send({
            title:'title2',
            price: 30
        })
        .expect(401)
})

it('returns a 400 if the user provided an invalid title or price', async () => {
    const cookie = global.signin()

    const response = await request(app)
        .post(`/api/tickets`)
        .set('Cookie',cookie)
        .send({
            title:'title',
            price: 20
        })

        await request(app)
            .put(`/api/tickets/${response.body.id}`)
            .set('Cookie',cookie)
            .send({
                title: '',
                price: 30
            })
            .expect(400)

        await request(app)
            .put(`/api/tickets/${response.body.id}`)
            .set('Cookie',cookie)
            .send({
                title: 'title2',
                price: -30
            })
            .expect(400)
})

it('update tickets', async () => {
    const cookie = global.signin()

    const response = await request(app)
        .post(`/api/tickets`)
        .set('Cookie',cookie)
        .send({
            title:'title',
            price: 20
        })
        
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie',cookie)
        .send({
            title: 'title2',
            price: 30
        })
        .expect(200)

    const tickeResponse = await request(app)
        .get(`/api/tickets/${response.body.id}`)
        .send()

    expect(tickeResponse.body.title).toEqual('title2')
})

it('publishes an event', async() => {
    const cookie = global.signin()

    const response = await request(app)
        .post(`/api/tickets`)
        .set('Cookie',cookie)
        .send({
            title:'title',
            price: 20
        })
        
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie',cookie)
        .send({
            title: 'title2',
            price: 30
        })
        .expect(200)
    
    expect(natsWrapper.client.publish).toHaveBeenCalled()   
})

it('rejects updates if the ticket is reserved', async() => {
    const cookie = global.signin()

    const response = await request(app)
        .post(`/api/tickets`)
        .set('Cookie',cookie)
        .send({
            title:'title',
            price: 20
        })
    
    const ticket = await Ticket.findById(response.body.id)
    ticket!.set({ orderId: new mongoose.Types.ObjectId().toHexString() })
    await ticket!.save()
        
    await request(app)
        .put(`/api/tickets/${response.body.id}`)
        .set('Cookie',cookie)
        .send({
            title: 'title2',
            price: 30
        })
        .expect(400)
})