import { Message } from "node-nats-streaming"
import mongoose from "mongoose"
import { TicketCreatedEvent } from "@ruhancstickets/common"
import { TicketCreatedListener } from "../ticketCreatedListener"
import { natsWrapper } from "../../../natsWrapper"
import { Ticket } from "../../../models/ticketModel"

const setup = async() => {
    // criar uma instancia do listener
    const listener = new TicketCreatedListener(natsWrapper.client)
    
    // criar dados falsos do evento
    const data: TicketCreatedEvent['data'] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        title: 'nba',
        price: 50,
        userId: new mongoose.Types.ObjectId().toHexString(),
    }
    
    // criar message object falsos do evento
    // @ts-ignore
    // ts ignorar propiedades de Message que nao serao utilizadas
    const msg: Message = {
        ack: jest.fn()
    }
    return { listener, data, msg }
}

it('create and save a ticket', async() => {
    const { listener, data, msg } = await setup()
    
    // chamar funçao onMessage com os dados falso e message object falso
    await listener.onMessage(data,msg)

    // verificar se o ticket foi criado
    const ticket = await Ticket.findById(data.id)
    expect(ticket).toBeDefined()
    expect(ticket!.title).toEqual(data.title)
})

it('acks the message', async() => {
    const { listener, data, msg } = await setup()
    // chamar funçao onMessage com os dados falso e message object falso
    await listener.onMessage(data,msg)

    // verificar se message.ack() foi chamado
    expect(msg.ack).toHaveBeenCalled()
})