import mongoose from 'mongoose';
import express, { Request, Response } from 'express';
import { requireAuth, validateRequest, NotFoundError, OrderStatus, BadRequestError } from '@ruhancstickets/common';
import { body } from 'express-validator';
import { Ticket } from '../models/ticketModel';
import { Order } from '../models/orderModel';
import { OrderCreatedPublisher } from '../events/publishers/orderCreatedPublisher';
import { natsWrapper } from '../natsWrapper';

const createOrderRouter = express.Router()

const EXPIRATION_WINDOW_SECONDS = 1 * 60

const validator = [
    body('ticketId')
        .not()
        .isEmpty()
        //verificar se o id do ticket e valido 
        .custom((input:string) => mongoose.Types.ObjectId.isValid(input))
        .withMessage('ticketId must be provided')
]

createOrderRouter.post('/api/orders',
    requireAuth,
    validator,
    validateRequest,
    async (req:Request,res:Response) => {
        const { ticketId } = req.body
        // encontrar o ticket que o usuario esta tentando comprar no db
        const ticket = await Ticket.findById(ticketId)
        if(!ticket) {
            throw new NotFoundError()
        }

        // verificar se o ticket ja foi reservado
        const isReserved =await ticket.isReserved()
        if(isReserved) {
            throw new BadRequestError('Ticket is already reserved')
        }

        // calcular o tempo de expiraçao da reserva do ticket (tempo que o usuario tem para pagar)
        const expiration = new Date();
        expiration.setSeconds(expiration.getSeconds() + EXPIRATION_WINDOW_SECONDS)// expira em 5 minutos

        // salvar a o pedido de compra no db
        const order = Order.build({
            userId: req.currentUser!.id,
            status: OrderStatus.Created,
            expiresAt: expiration,
            ticket: ticket
        })
        await order.save()

        // enviar o evento para os outros serviços
        new OrderCreatedPublisher(natsWrapper.client).publish({
            id: order.id,
            version: order.version,
            status: order.status,
            userId: order.userId,
            expiresAt: order.expiresAt.toISOString(),// data em formato de string utc
            ticket: {
                id: ticket.id,
                price: ticket.price
            }
        })

        res.status(201).send(order)
})

export { createOrderRouter }
