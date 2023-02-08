import mongoose from 'mongoose';

import { app } from './app';

const start = async () => {
    // informar para o typescript que process.env.JWT_KEY caso nao exista tera um erro
    if(!process.env.JWT_KEY) {
        throw new Error('key not found! JWT_KEY must be defined')
    }

    if(!process.env.MONGO_URI) {
        throw new Error('MONGO_URI must be defined')
    }

    try {
        mongoose.set('strictQuery', false)
        // conecta ao mongo db criado no kubernets
        await mongoose.connect(process.env.MONGO_URI).then(con => {
            console.log('DB connection succesfully')
        })
    } catch(err) {
        console.error(err)
    }
    app.listen(3000, () => {
        console.log('Listening on port 3000 ...')
    })
}

start()