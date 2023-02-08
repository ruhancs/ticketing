import { Message } from "node-nats-streaming";
import { Subjects, Listener, TicketUpdatedEvent } from "@ruhancstickets/common";
import { Ticket } from "../../models/ticketModel";
import { queueGroupName } from "./queueGroupName";


export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
    queueGroupName = queueGroupName;

    async onMessage(data: TicketUpdatedEvent['data'], msg:Message) {
        // ticket da versao anterior para atualizar , evitar que o evento seja processado na ordem errada 
        const ticket = await Ticket.findPreviousEvent(data)

        if(!ticket) {
            throw new Error('Ticket not found')
        }

        const { title,price } = data
        ticket.set({ title,price })
        await ticket.save()

        msg.ack()
    }
}