import  express  from "express";
import 'express-async-errors'// utilizar throw new error dentro de funçoes async
import { json } from 'body-parser';
import cookieSession from 'cookie-session';// instalar para usar no typescript: npm i @types/cookie-session
import { errorHandler,NotFoundError } from "@ruhancstickets/common";

import { currentUserRouter } from "./routes/currentUser";
import { signinRouter } from "./routes/signin";
import { signoutRouter } from "./routes/signout";
import { signupRouter } from "./routes/signup";

const app = express()
app.set('trust proxy', true)//informar ao express que ele esta atras de proxys do ingress-ngynx seguro 
app.use(json());
app.use(cookieSession({
    signed: false,// desabilitar criptografia do cookie
    // usuario so podera ver com conexao https
    secure: process.env.NODE_ENV !== 'test',//para os testes conexao nao pode ser https
}))

app.use(currentUserRouter)
app.use(signinRouter)
app.use(signoutRouter)
app.use(signupRouter)

// qualquer rota que nao exista ira retornar NotFoundError
app.all('*', async (req,res) => {
    throw new NotFoundError()
})

app.use(errorHandler)

export { app }