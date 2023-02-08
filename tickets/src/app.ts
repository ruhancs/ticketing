import  express, { Request,Response }  from "express";
import 'express-async-errors'// utilizar throw new error dentro de funçoes async
import { json } from 'body-parser';
import cookieSession from 'cookie-session';// instalar para usar no typescript: npm i @types/cookie-session
import { errorHandler,NotFoundError,currentUser } from "@ruhancstickets/common";
import { ticketById } from "./routes/ticketById";
import { allTicketsRouter } from "./routes/allTickets";
import { updateTicketRouter } from "./routes/updateTicket";

import { createTicketRouter } from "./routes/new";

const app = express()
app.set('trust proxy', true)//informar ao express que ele esta atras de proxys do ingress-ngynx seguro 
app.use(json());
app.use(cookieSession({
    signed: false,// desabilitar criptografia do cookie
    // usuario so podera ver com conexao https
    secure: process.env.NODE_ENV !== 'test',//para os testes conexao nao pode ser https
}))

app.use(currentUser)

app.use(createTicketRouter)
app.use(allTicketsRouter)
app.use(ticketById)
app.use(updateTicketRouter)

// qualquer rota que nao exista ira retornar NotFoundError
app.all('*', async (req:Request,res:Response) => {
    throw new NotFoundError()
})

app.use(errorHandler)

export { app }