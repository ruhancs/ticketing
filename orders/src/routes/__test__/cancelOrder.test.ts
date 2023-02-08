import request from 'supertest'
import mongoose from 'mongoose';
import { app } from '../../app'
import { Order,OrderStatus } from '../../models/orderModel';
import { Ticket } from '../../models/ticketModel';
import { natsWrapper } from '../../natsWrapper';

it('marks an order as cancelled', async() => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    })
    await ticket.save()

    const user = global.signin()
    const {body:order} = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201)

    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie',user)
        .send()
        .expect(204)

    const orderCancelled = await Order.findById( order.id )
    expect(orderCancelled!.status).toEqual(OrderStatus.Cancelled)
})

it('emits a order cancelled event', async() => {
    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'concert',
        price: 20
    })
    await ticket.save()

    const user = global.signin()
    const {body:order} = await request(app)
        .post('/api/orders')
        .set('Cookie', user)
        .send({ ticketId: ticket.id })
        .expect(201)

    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set('Cookie',user)
        .send()
        .expect(204)

    expect(natsWrapper.client.publish).toHaveBeenCalled()
})