import express, { Request, Response } from 'express';
import {  NotAuthorizedError, NotFoundError, requireAuth } from '@ruhancstickets/common';
import { Order } from '../models/orderModel';

const orderByIdRouter = express.Router()

orderByIdRouter.get('/api/orders/:orderId',requireAuth,async (req:Request,res:Response) => {
    const order =await Order.findById( req.params.orderId ).populate('ticket')

    if(!order) {
        throw new NotFoundError()
    }

    if(order.userId !== req.currentUser!.id){
        throw new NotAuthorizedError()
    }

    res.send(order)
})

export { orderByIdRouter }
