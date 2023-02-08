// dependencias para test instalaçao
//  npm i --save-dev @types/jest @types/supertest jest ts-jest supertest mongodb-memory-server

import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { app } from '../app';

// para conseguir utilizar global.signin em todos testes
declare global {
    var signin: () => Promise<string[]>;
  }

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

  global.signin = async () => {
    const email = 'test@test.com'
    const password = 'password'

    const response = await request(app)
        .post('/api/users/signup')
        .send({
            email,
            password
        })
        .expect(201)

    const cookie = response.get('Set-Cookie')
    return cookie
  }