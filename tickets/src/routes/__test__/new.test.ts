import request from 'supertest';
import { app } from '../../app';
import { Ticket } from '../../models/ticketsModel';
import { natsWrapper } from '../../natsWrapper';


it( 'has a route listening to /api/tickets for post',async () => {
    const response = await request(app)
        .post('/api/tickets')
        .send({})
    expect(response.status).not.toEqual(404)
})

it( 'can only be accessed if the user is signed in',async () => {
    await request(app)
        .post('/api/tickets')
        .send({})
        .expect(401)
})

it('user authorized return 201', async() => { 
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'test',
            price: 10
        })
        .expect(201)
})

it( 'return an error if an invalid title is provided',async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: '',
            price: 10
        })
        .expect(400)

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            price: 10
        })
        .expect(400)
})

it( 'return error if an invalid price is provided',async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'test',
            price: -10
        })
        .expect(400)
    
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'test'
        })
        .expect(400)
})

it( 'creates a tickets with valid inputs',async () => {
    let tickets = await Ticket.find({})
    expect(tickets.length).toEqual(0)

    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'test',
            price: 20
        })
        .expect(201)
    tickets = await Ticket.find({})
    expect(tickets.length).toEqual(1)
    expect(tickets[0].price).toEqual(20)
    expect(tickets[0].title).toEqual('test')
})

it('publishes an event', async () => {
    await request(app)
        .post('/api/tickets')
        .set('Cookie', global.signin())
        .send({
            title: 'test',
            price: 20
        })
        .expect(201)

    expect(natsWrapper.client.publish).toHaveBeenCalled()
})