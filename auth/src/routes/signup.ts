// kubectl create secret generic jwt-secret --from-literal=JWT_KEY=segredojwt

import express, { Request, Response } from 'express';
import { body } from 'express-validator';// fazer a validaçao e sanitizaçao dos dados do body
// npm i jsonwebtoken @types/jsonwebtoken
import jwt from 'jsonwebtoken';
import { validateRequest,BadRequestError } from '@ruhancstickets/common';

import { User } from '../../models/userModel';

const signupRouter = express.Router()

const validationData = [
    body('email')
        .isEmail()
        .withMessage('Email must be valid'),
    body('password')
        .trim()
        .isLength( { min:4, max:20 } )
        .withMessage('Password must be between 4 and 20 characters')
]

signupRouter.post('/api/users/signup',validationData,validateRequest, async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existinUser = await User.findOne({ email:email })

    if(existinUser) {
        throw new BadRequestError('Email already exists')
    }

    const user = User.build({ email,password })

    await user.save()
        
        // Gerar JWT
        const userJwt = jwt.sign({
                id: user.id,
                email: user.email,
            }, 
            process.env.JWT_KEY!// ! informa ao tipescrypt que JWT_KEY esta sendo checado se existe em outro lugar 
        );

        // Armazenar token na sessao
        req.session = {
            jwt: userJwt
        };
        
        return res.status(201).send(user);
})

export { signupRouter };