import express, { Request, Response } from 'express';
import { body } from 'express-validator';// fazer a validaçao e sanitizaçao dos dados do body
import jwt from 'jsonwebtoken';
import { validateRequest,BadRequestError } from '@ruhancstickets/common';

import { Password } from '../../utils/password';
import { User } from '../../models/userModel';

const signinRouter = express.Router()

const validationData = [
    body('email')
        .isEmail()
        .withMessage('Email must be valid'),
    body('password')
        .trim()//remove espaços 
        .notEmpty()
        .withMessage('You must suppy a password')
]

signinRouter.post('/api/users/signin',
    validationData,
    validateRequest,
    async (req: Request, res: Response) => {
        const { email, password } = req.body;

        const existingUser = await User.findOne({ email:email })
        if(!existingUser) {
            throw new BadRequestError('Invalid credencials')
        }
        
        const passordMatch = await Password.compare(existingUser.password,password)
        if(!passordMatch) {
            throw new BadRequestError('Invalid credencials')
        }

        // Gerar JWT
        const userJwt = jwt.sign({
            id: existingUser.id,
            email: existingUser.email,
        }, 
        process.env.JWT_KEY!// ! informa ao tipescrypt que JWT_KEY esta sendo checado se existe em outro lugar 
        );

        // Armazenar token na sessao
        req.session = {
            jwt: userJwt
        };
        
        return res.status(200).send(existingUser);
});

export { signinRouter };