import { Message } from "node-nats-streaming";
import { Listener,OrderCancelled, Subjects } from "@ruhancstickets/common";
import { queueGroupName } from "./queueGroupName";
import { Ticket } from "../../models/ticketsModel";
import { TicketUpdatedPublisher } from "../publishers/ticketUpdatedPublisher";

export class OrderCancelledListener extends Listener<OrderCancelled> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName = queueGroupName
    
    async onMessage(data:OrderCancelled['data'],msg:Message) {
        const ticket = await Ticket.findById(data.ticket.id)

        if(!ticket) {
            throw new Error('Ticket not found')
        }

        ticket.set({ orderId: undefined })
        await ticket.save()

        new TicketUpdatedPublisher(this.client).publish({
            id:ticket.id,
            orderId: ticket.orderId,
            userId: ticket.userId,
            title: ticket.title,
            price: ticket.price,
            version: ticket.version
        })

        msg.ack()
    }
}