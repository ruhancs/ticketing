import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { Ticket } from '../models/ticketsModel';
import { 
    validateRequest,
    NotFoundError,
    requireAuth,
    NotAuthorizedError,
    BadRequestError
} from '@ruhancstickets/common';
import { TicketUpdatedPublisher } from '../events/publishers/ticketUpdatedPublisher';
import { natsWrapper } from '../natsWrapper';

const updateTicketRouter = express.Router()

const validation = [
    body('title')
        .not()
        .isEmpty()
        .withMessage('Title is required'),
    body('price')
        .isFloat({ gt: 0 })
        .withMessage('price must be greater than 0')
]

updateTicketRouter.put('/api/tickets/:id',requireAuth,validation ,validateRequest, async(req:Request,res:Response) => {
    const ticket = await Ticket.findById(req.params.id)

    if(!ticket) {
        throw new NotFoundError()
    }

    // nao permitir atualizar o ticket se ele estiver com uma order em aberto
    if(ticket.orderId){
        throw new BadRequestError('Cannot edit a reserved ticket');
    }

    if (ticket.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError()
    }

    ticket.set({
        title: req.body.title,
        price: req.body.price
    })

    await ticket.save()

    new TicketUpdatedPublisher(natsWrapper.client).publish({
        id: ticket.id,
        version: ticket.version,
        title: ticket.title,
        price: ticket.price,
        userId: ticket.userId
    })

    res.send(ticket)
})

export { updateTicketRouter }