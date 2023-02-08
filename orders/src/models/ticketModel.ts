import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";
import { Order,OrderStatus } from "./orderModel";

interface TicketAttrs {
    id: string;
    title:string;
    price:number;
}

interface TicketDoc extends mongoose.Document {
    title:string;
    price:number;
    version: number;
    isReserved(): Promise<boolean>
}

interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs):TicketDoc
    findPreviousEvent(event: {id:string, version: number}): Promise<TicketDoc | null>;
}

const ticketSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
},{
    toJSON : {
        transform(doc,ret) {
            ret.id = ret._id;
            delete ret._id;
        }
    }
})

// adicionar versionamento automatico ao ticket para evitar que os eventos sejam processados na ordem errada
// trocar __v por version
ticketSchema.set('versionKey', 'version')
ticketSchema.plugin(updateIfCurrentPlugin)

ticketSchema.statics.findPreviousEvent = (event:{id:string, version: number}) => {
    return Ticket.findOne({
        _id: event.id,
        version: event.version - 1
    })
}

ticketSchema.statics.build = (attrs:TicketAttrs) => {
    return new Ticket({
        // para o id do ticket criado, ser o mesmo do recebido do serviço de tickets
        _id: attrs.id, 
        title: attrs.title,
        price: attrs.price,
    });
}

ticketSchema.methods.isReserved =async function() {
    const existingOrder =await Order.findOne({
        ticket:this,
        status: { // se order nao estiver com status cancelled o ticket nao pode ser comprado 
            $in: [
                OrderStatus.Created,
                OrderStatus.AwaitingPayment,
                OrderStatus.Complete
            ]
        }
    })

    return !!existingOrder // true or false
}

const Ticket = mongoose.model<TicketDoc,TicketModel>('Ticket', ticketSchema)

export { Ticket,TicketDoc }