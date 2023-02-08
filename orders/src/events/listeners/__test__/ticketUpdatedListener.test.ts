import { Message } from "node-nats-streaming"
import mongoose from "mongoose"
import {  TicketUpdatedEvent } from "@ruhancstickets/common"
import { TicketUpdatedListener } from "../ticketUpdateListener"
import { natsWrapper } from "../../../natsWrapper"
import { Ticket } from "../../../models/ticketModel"

const setup = async() => {
    // criar uma instancia do listener
    const listener = new TicketUpdatedListener(natsWrapper.client)

    // criar um Ticket
    const ticket = await Ticket.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: 'nba',
        price: 50,        
    }) 
    await ticket.save()

    // criar dados falsos do evento
    const data: TicketUpdatedEvent['data'] = {
        id: ticket.id,
        version: ticket.version + 1,
        title: ticket.title,
        price: 999,
        userId: new mongoose.Types.ObjectId().toHexString(),
    }
    
    // criar message object falsos do evento
    // @ts-ignore
    // ts ignorar propiedades de Message que nao serao utilizadas
    const msg: Message = {
        ack: jest.fn() // __mocks__
    }
    return { listener, data, msg, ticket }
}

it('finds, updates, and save a ticket', async() => {
    const { listener, data, msg, ticket } = await setup()

    await listener.onMessage(data,msg)

    const updatedTicket = await Ticket.findById(ticket.id)
    expect(updatedTicket!.price).toEqual(data.price)
    expect(updatedTicket!.version).toEqual(data.version)
})

it('acks the message', async() => {
    const { listener, data, msg } = await setup()

    await listener.onMessage(data,msg)

    expect(msg.ack).toHaveBeenCalled();
})

it('does not call ack if the event has skipped version number', async() => {
    const { listener, data, msg } = await setup()

    data.version = 5;

    try {
        await listener.onMessage(data,msg)
    } catch(err) {
        
    }

    expect(msg.ack).not.toHaveBeenCalled();
})