import  express, { Request,Response }  from "express";
import 'express-async-errors'// utilizar throw new error dentro de funçoes async
import { json } from 'body-parser';
import cookieSession from 'cookie-session';// instalar para usar no typescript: npm i @types/cookie-session
import { errorHandler,NotFoundError,currentUser } from "@ruhancstickets/common";
import { allOrdersRouter } from "./routes/allOrders";
import { createOrderRouter } from "./routes/createOrder";
import { deleteOrderRouter } from "./routes/deleteOrder";
import { orderByIdRouter } from "./routes/orderById";

const app = express()
app.set('trust proxy', true)//informar ao express que ele esta atras de proxys do ingress-ngynx seguro 
app.use(json());
app.use(cookieSession({
    signed: false,// desabilitar criptografia do cookie
    // usuario so podera ver com conexao https
    secure: process.env.NODE_ENV !== 'test',//para os testes conexao nao pode ser https
}))

app.use(currentUser)

app.use(createOrderRouter)
app.use(allOrdersRouter)
app.use(orderByIdRouter)
app.use(deleteOrderRouter)

// qualquer rota que nao exista ira retornar NotFoundError
app.all('*', async (req:Request,res:Response) => {
    throw new NotFoundError()
})

app.use(errorHandler)

export { app }