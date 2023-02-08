import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticketsModel';

const allTicketsRouter = express.Router()

allTicketsRouter.get('/api/tickets',async (req:Request,res:Response) => {
    const tickets = await Ticket.find({ orderId: undefined })

    res.send(tickets)
})

export { allTicketsRouter }