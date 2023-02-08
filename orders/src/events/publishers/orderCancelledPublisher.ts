// OrderCancelledEvent nao atualizado 
import { Subjects, Publisher,OrderCancelled } from "@ruhancstickets/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelled> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}