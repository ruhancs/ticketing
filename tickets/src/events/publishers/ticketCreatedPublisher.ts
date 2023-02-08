import { Publisher, Subjects, TicketCreatedEvent } from "@ruhancstickets/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
    subject: Subjects.TicketCreated = Subjects.TicketCreated;
}