import { Listener, ExpirationCompleteEvent, Subjects, OrderStatus } from "@ruhancstickets/common";
import { Message } from "node-nats-streaming";
import { queueGroupName } from "./queueGroupName";
import { Order } from "../../models/orderModel";
import { OrderCancelledPublisher } from "../publishers/orderCancelledPublisher";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent>{
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
    queueGroupName = queueGroupName;

    async onMessage(data:ExpirationCompleteEvent['data'],msg:Message) {
        const order = await Order.findById(data.orderId).populate('ticket')

        if(!order){
            throw new Error('Order Not found')
        }

        // verificar se order ja foi pago
        if(order.status === OrderStatus.Complete) {
            return msg.ack()
        }

        // order.status = OrderStatus.Cancelled
        order.set({
            status: OrderStatus.Cancelled,
        })
        await order.save()

        await new OrderCancelledPublisher(this.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id
            }
        })

        msg.ack()
    }
}