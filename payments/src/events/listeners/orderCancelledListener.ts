import { Message } from "node-nats-streaming";
import { Order } from "../../models/orderModel";
import { OrderCancelled, Subjects, Listener, OrderStatus } from "@ruhancstickets/common";
import { queueGroupName } from "./queueGroupName";

export class OrderCancelledListener extends Listener<OrderCancelled> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName = queueGroupName

    async onMessage(data:OrderCancelled['data'],msg:Message) {
        const order = await Order.findOne({
            _id: data.id,
            version: data.version - 1
        })

        if(!order) {
            throw new Error('Order not found')
        }

        order.set({
            status: OrderStatus.Cancelled
        })
        await order.save()

        msg.ack()
    }
}