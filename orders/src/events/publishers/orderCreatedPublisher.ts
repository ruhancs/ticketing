import { Publisher,OrderCreatedEvent,Subjects } from "@ruhancstickets/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
}