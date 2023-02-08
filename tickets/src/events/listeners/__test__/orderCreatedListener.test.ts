import mongoose from "mongoose"
import { Message } from "node-nats-streaming"
import { OrderCreatedEvent, OrderStatus } from "@ruhancstickets/common"
import { OrderCreatedListener } from "../orderCreatedListener"
import { natsWrapper } from "../../../natsWrapper"
import { Ticket } from "../../../models/ticketsModel"

const setup = async() => {
    // criar um listener
    const listener = new OrderCreatedListener(natsWrapper.client)

    // criar ticket
    const ticket = Ticket.build({
        title: 'nba',
        price: 50,
        userId: '123'
    })
    await ticket.save()

    // criar OrderCreatedEvent data falso
    const data:OrderCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        status: OrderStatus.Created,
        userId: 'abc',
        expiresAt: 'asfadf',
        ticket: {
            id: ticket.id,
            price: ticket.price,
        } 
    }

    // criar Message object falso para utilizar ack
    // informar ao ts para ignorar as propiedades de Message
    // @ts-ignore
    const msg:Message = {
        ack: jest.fn()
    }

    return { listener, data, msg, ticket }
}

it('sets the orderId of the ticket', async() => {
    const { listener,data,ticket,msg } = await setup()

    await listener.onMessage(data,msg)

    const updatedTicket = await Ticket.findById(ticket.id)

    expect(updatedTicket!.orderId).toEqual(data.id)
})

it('acks the message', async() => {
    const { listener,data,ticket,msg } = await setup()

    await listener.onMessage(data,msg)

    expect(msg.ack()).toHaveBeenCalled()
})

it('publishes a ticket updated event', async() => {
    const { listener, ticket, data, msg } = await setup()

    await listener.onMessage(data,msg)

    expect(natsWrapper.client.publish).toHaveBeenCalled()
})
