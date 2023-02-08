// dependencias para test instalaçao
//  npm i --save-dev @types/jest @types/supertest jest ts-jest supertest mongodb-memory-server

import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';
import jwt from 'jsonwebtoken';

// para conseguir utilizar global.signin em todos testes
declare global {
  var signin: (id?: string) => string[];
}

// criar arquivo falso natsWrapper que esta em __mocks__ para ser utilizado nos testes
jest.mock('../natsWrapper')

let mongo:any;
// roda antes de iniciar os tests
beforeAll(async () => {
    process.env.JWT_KEY = 'jgfjhg'

    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    mongoose.set('strictQuery', true)
    await mongoose.connect(mongoUri,{})
});

beforeEach(async () => {
    // limpar a funçao em __mocks__
    jest.clearAllMocks()

    // todas coleçoes criadas para o teste
    const collections = await mongoose.connection.db.collections();

    // deletar todas coleçoes
    for (let collection of collections) {
        await collection.deleteMany({})
    }
})

// parar os dbs apos terminar os testes
afterAll(async () => {
    if (mongo) {
      await mongo.stop();
    }
    await mongoose.connection.close();
  });

  global.signin = () => {
    const payload = {
      id: new  mongoose.Types.ObjectId().toHexString(),
      email: 'test@test.com'
    };
    const token = jwt.sign(payload,process.env.JWT_KEY!)

    const session = { jwt: token }

    const sessionJSON = JSON.stringify(session)

    // encodificar JSON em base64
    const base64 = Buffer.from(sessionJSON).toString('base64')

    return [`session=${base64}`];

  }