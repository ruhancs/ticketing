import mongoose from "mongoose"
import { Message } from "node-nats-streaming"
import { OrderCancelledListener } from "../orderCancelledListener"
import { OrderCancelled } from "@ruhancstickets/common"
import { natsWrapper } from "../../../natsWrapper"
import { Ticket } from "../../../models/ticketsModel"

const setup = async() => {
    const listener = new OrderCancelledListener(natsWrapper.client)
    
    const orderId = new mongoose.Types.ObjectId().toHexString()
    const ticket = Ticket.build({
        title: 'nba',
        price: 50,
        userId: '123',
    })
    ticket.set({ orderId })
    await ticket.save()

    const data:OrderCancelled['data'] = {
        id: orderId,
        version: 0,
        ticket: {
            id: ticket.id
        }
    }

    // @ts-ignore
    const msg:Message = {
        ack: jest.fn()
    }
    
    return { msg,data,ticket,orderId,listener }
}

it('updates the ticket, publishes an event', async() => {
    const { msg,data,ticket,orderId,listener } = await setup()

    await listener.onMessage(data,msg)

    const updatedTicket = await Ticket.findById(ticket.id)
    expect(updatedTicket!.orderId).not.toBeDefined()
    expect(msg.ack).toHaveBeenCalled()
})