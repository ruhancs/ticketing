import mongoose from 'mongoose';
import { Message } from 'node-nats-streaming';
import { OrderStatus, OrderCancelled } from '@ruhancstickets/common';
import { OrderCancelledListener } from '../orderCancelledListener'
import { natsWrapper } from "../../../natsWrapper";
import { Order } from '../../../models/orderModel';


const setup = async() => {
    const listener = new OrderCancelledListener(natsWrapper.client)

    const order = await Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        price: 100,
        userId: 'qeqw',
        version: 0
    })

    await order.save()

    const data: OrderCancelled['data'] = {
        id: order.id,
        version: 1,
        ticket: {
            id: 'qweyg'
        }
    }

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn()
    }

    return { listener, data, order, msg }
}

it('updates the status of the order', async() => {
    const { listener, data, order, msg } = await setup()

    await listener.onMessage(data,msg)

    const cancelledOrder = await Order.findById(order.id)

    expect(cancelledOrder!.status).toEqual(OrderStatus.Cancelled)
})

it('acks the message', async() => {
    const { listener, data, order, msg } = await setup()

    await listener.onMessage(data,msg)

    expect(msg.ack).toHaveBeenCalled()
})