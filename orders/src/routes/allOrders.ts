import express, { Request, Response } from 'express';
import { requireAuth } from '@ruhancstickets/common';
import { Order } from '../models/orderModel';

const allOrdersRouter = express.Router()

allOrdersRouter.get('/api/orders',requireAuth,async (req:Request,res:Response) => {
    const orders = await Order.find({ userId: req.currentUser!.id }).populate('ticket')   

    res.send(orders)
})

export { allOrdersRouter }
