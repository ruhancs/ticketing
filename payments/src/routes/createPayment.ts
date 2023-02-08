import express, { Request, Response } from 'express';
import { body } from 'express-validator';
import { 
        requireAuth, 
        validateRequest,
        BadRequestError,
        NotFoundError,
        NotAuthorizedError,
        OrderStatus
    } from '@ruhancstickets/common';
import { stripe } from '../stripe';
import { Order } from '../models/orderModel';
import { Payment } from '../models/paymentsModel';
import { PaymentCreatedPublisher } from '../events/publishers/paymentCreatedPublisher';
import { natsWrapper } from '../natsWrapper';

const createPaymentRouter = express.Router()

const validator = [
    body('token')
        .not()
        .isEmpty(),
    body('orderId')
        .not()
        .isEmpty()
]

createPaymentRouter.post('/api/payments',requireAuth, validator, validateRequest ,async (req:Request, res:Response) => {
    const { token, orderId } = req.body

    const order = await Order.findById(orderId)

    if(!order) {
        throw new NotFoundError()
    }

    if (order.userId !== req.currentUser!.id) {
        throw new NotAuthorizedError()
    }

    if(order.status === OrderStatus.Cancelled) {
        throw new BadRequestError('Cannot pay for an cancelled order')
    }

    const charge = await stripe.charges.create({
        currency: 'usd',
        amount: order.price * 100,
        source: token // para validaçao da requisiçao de pagamento
    });

    const payment = Payment.build({
        orderId: orderId,
        stripeId: charge.id
    })
    await payment.save()

    new PaymentCreatedPublisher(natsWrapper.client).publish({
        id: payment.id,
        orderId: payment.orderId,
        stripeId: payment.stripeId
    })

    res.status(201).send({ id: payment.id })
})

export { createPaymentRouter }