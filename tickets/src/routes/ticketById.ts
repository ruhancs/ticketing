import express, { Request, Response } from 'express';
import { Ticket } from '../models/ticketsModel';
import { NotFoundError } from '@ruhancstickets/common';

const ticketById = express.Router()

ticketById.get('/api/tickets/:id', async(req,res) => {
    const ticket = await Ticket.findById( req.params.id )

    if(!ticket) {
        throw new NotFoundError()
    }

    res.send(ticket)
})

export { ticketById }