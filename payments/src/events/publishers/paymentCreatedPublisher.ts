import { Publisher, Subjects, PaymentCreatedEvent } from "@ruhancstickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}