import { Message } from "node-nats-streaming"
import mongoose from "mongoose"
import { OrderStatus, ExpirationCompleteEvent } from '@ruhancstickets/common'
import { ExpirationCompleteListener } from "../expirationCompleteListener"
import { natsWrapper } from "../../../natsWrapper"
import { Ticket } from "../../../models/ticketModel"
import { Order } from "../../../models/orderModel"

const setup = async() => {
    const listener = new ExpirationCompleteListener(natsWrapper.client)

    const ticket = Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'nfl',
        price: 200
    })
    await ticket.save()

    const order = Order.build({
        status: OrderStatus.Created,
        userId: 'userjs',
        expiresAt: new Date(),
        ticket
    })
    await order.save()

    const data: ExpirationCompleteEvent['data'] = {
        orderId: order.id
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, order, ticket, data, msg }
}

it('updates the order status to cancelled', async() => {
    const { listener, order, ticket, data, msg } = await setup()

    await listener.onMessage(data,msg)

    const expiredOrder = await Order.findById(order.id)

    expect(expiredOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('emit an OrderCancelled event', async() => {
    const { listener, order, ticket, data, msg } = await setup()

    await listener.onMessage(data,msg)

    // informar ao ts que e uma mock func
    const eventData = JSON.parse((natsWrapper.client.publish as jest.Mock).mock.calls[0][1])

    expect(eventData.id).toEqual(order.id)
})

it('ack the message', async() => {
    const { listener, order, ticket, data, msg } = await setup()

    await listener.onMessage(data,msg)

    expect(msg.ack).toHaveBeenCalled()
})