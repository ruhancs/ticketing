import { Message } from "node-nats-streaming";
import { Listener,OrderCreatedEvent, Subjects } from "@ruhancstickets/common";
import { queueGroupName } from "./queueGroupName";
import { Ticket } from "../../models/ticketsModel";
import { TicketUpdatedPublisher } from "../publishers/ticketUpdatedPublisher";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName

    async onMessage(data:OrderCreatedEvent['data'],msg:Message) {
        // encontrar o ticket que foi reservado, criado no service order
        const ticket = await Ticket.findById(data.ticket.id)

        // se nao encontrar o ticket, enviar erro
        if(!ticket) {
            throw new Error('ticket not found')
        }

        // marcar o ticket como reservado
        // ticket.orderId = data.id
        ticket.set({ orderId: data.id })
        await ticket.save()
        await new TicketUpdatedPublisher(this.client).publish({
            id: ticket.id,
            price: ticket.price,
            title: ticket.title,
            userId: ticket.userId,
            orderId: ticket.orderId,
            version: ticket.version
        })

        msg.ack()
    }

}
