import { Message } from "node-nats-streaming";
import { Subjects, Listener, TicketCreatedEvent } from "@ruhancstickets/common";
import { Ticket } from "../../models/ticketModel";
import { queueGroupName } from "./queueGroupName";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
    subject: Subjects.TicketCreated = Subjects.TicketCreated;
    queueGroupName = queueGroupName// grupo que o listener conecta para receber o evento

    // data sao os dados do evento
    // msg para utilizar o ack(), informando que o evento foi processado com sucesso
    async onMessage(data: TicketCreatedEvent['data'], msg: Message)  {
        // quando um ticket e criado cria uma copia do ticket no serviço orders
        const { id, title,price } = data;
        const ticket = Ticket.build({
            id,
            title,
            price
        }) 
        await ticket.save()

        msg.ack()
    }
}