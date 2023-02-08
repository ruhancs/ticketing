import { Message } from 'node-nats-streaming'
import { Listener, OrderCreatedEvent,Subjects } from "@ruhancstickets/common";
import { queueGroupName } from "./queueGroupName";
import { expirationQueue } from '../../../queues/expirationQueue';

export class OrderCreatedListener extends Listener<OrderCreatedEvent>{
    subject:Subjects.OrderCreated = Subjects.OrderCreated
    queueGroupName = queueGroupName

    async onMessage(data:OrderCreatedEvent['data'],msg:Message) {
    // tempo de expiresAt em ms - tempo atual em ms
        const delay = new Date(data.expiresAt).getTime() - new Date().getTime()
        console.log(`waiting ... ${delay}ms`)

        // enviar o job ao redis para contar o tempo de expiraçao da order
        await expirationQueue.add({
            orderId: data.id
        }, {
            delay: delay,// tempo para de atraso para processar o job recebido do redis
        });

        msg.ack();
    }
}