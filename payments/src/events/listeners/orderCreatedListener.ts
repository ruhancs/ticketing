import { Message } from "node-nats-streaming";
import { Listener, OrderCreatedEvent, Subjects } from "@ruhancstickets/common";
import { queueGroupName } from "./queueGroupName";
import { Order } from "../../models/orderModel";


export class OrderCreatedListener extends Listener <OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName

    async onMessage(data:OrderCreatedEvent['data'], msg:Message){
        const order = Order.build({
            id: data.id,
            version: data.version,
            userId: data.userId,
            price: data.ticket.price,
            status: data.status
        })

        await order.save()

        msg.ack()
    }
}