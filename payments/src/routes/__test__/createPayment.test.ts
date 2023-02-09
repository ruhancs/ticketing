import { OrderStatus } from "@ruhancstickets/common";
import mongoose from "mongoose";
import  request  from "supertest";
import { app } from "../../app";
import { Order } from "../../models/orderModel";
import { stripe } from "../../stripe";
import { Payment } from "../../models/paymentsModel";

// jest.mock('../../stripe')

it('return a 404 when an order does not exist', async() => {
    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'asdghavs',
            orderId: new mongoose.Types.ObjectId().toHexString()
        })
        .expect(404)
})

it('return a 401 when purchasing an order that doesnt belong to the user', async() => {
    const order = await Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 100,
        status: OrderStatus.Created
    })
    await order.save()

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin())
        .send({
            token: 'asdghavs',
            orderId: order.id
        })
        .expect(401)

})

it('return a 400 when purchasing a cancelled order', async() => {
    const userId = new mongoose.Types.ObjectId().toHexString()

    const order = await Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: userId,
        version: 0,
        price: 100,
        status: OrderStatus.Cancelled
    })
    await order.save()

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'asdghavs',
            orderId: order.id
        })
        .expect(400)    
})

it('returns a 201 with valid inputs', async() => {
    const userId = new mongoose.Types.ObjectId().toHexString()
    const price = Math.floor(Math.random() * 100000)
    const order = await Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        userId: userId,
        version: 0,
        price: price,
        status: OrderStatus.Created
    })
    await order.save()

    await request(app)
        .post('/api/payments')
        .set('Cookie', global.signin(userId))
        .send({
            token: 'tok_visa',
            orderId: order.id            
        })
        .expect(201)
    
    // encontrar o payment pelo price de order, que foi gerado aleatoriamente
    const stripeCharges = await stripe.charges.list({ limit: 50 })
    const stripeCharge = stripeCharges.data.find(charge => {
        return charge.amount === price * 100
    })

    expect(stripeCharge).toBeDefined()

    const payment = await Payment.findOne({
        orderId: order.id,
        paymentId: stripeCharge!.id
    })
    expect(payment).not.toBeNull()
        
        // // chargeOptions é os atributos de stripe.charges.create
        // const chargeOptions = (stripe.charges.create as jest.Mock).mock.calls[0][0]
        // expect(chargeOptions.source).toEqual('tok_visa')
})