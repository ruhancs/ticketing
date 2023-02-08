import express , { Request, Response } from 'express';
import { body } from 'express-validator';
import { Ticket } from '../models/ticketsModel';
import { requireAuth, validateRequest } from '@ruhancstickets/common';
import { TicketCreatedPublisher } from '../events/publishers/ticketCreatedPublisher';
import { natsWrapper } from '../natsWrapper';

const createTicketRouter = express.Router()

const validation = [
    body('title')
        .not()
        .isEmpty()
        .withMessage('Title is required'),
    body('price')
        .isFloat({ gt: 0 })
        .withMessage('price must be greater than 0')
]

createTicketRouter.post('/api/tickets',
    requireAuth,
    validation,
    validateRequest,
    async (req:Request,res:Response) => {
        const { title, price } = req.body

        const ticket = Ticket.build({
            title,
            price,
            userId: req.currentUser!.id
        })
        await ticket.save();
        
        // informa ao NAT que o que um ticket foi criado
        await new TicketCreatedPublisher(natsWrapper.client).publish({
            id: ticket.id,
            version: ticket.version,
            title: ticket.title,
            price: ticket.price,
            userId: ticket.userId
        })

        res.status(201).send(ticket)
})

export { createTicketRouter }