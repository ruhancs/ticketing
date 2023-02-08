import nats, { Stan } from "node-nats-streaming";

// criar o client para ser utilizado nos eventos criados

class NatsWrapper {
    private _client?:Stan // define que a propiedade sera undefined por certo tempo

    // para utilizar o client apos ele ser criado em connect()
    get client() {
        if(!this._client) {
            throw new Error('Cannot access NATS client before connecting')
        }

        return this._client
    }

    connect(clusterId:string, clientId:string, url:string) {
        this._client = nats.connect(clusterId,clientId, { url })

        return new Promise<void>((resolve, reject) => {
            this.client.on('connect', () => {
              console.log('Connected to NATS');
              resolve();
        });
        this.client.on('error', (err) => {
            reject(err)
        })
    })
}
}

export const natsWrapper = new NatsWrapper();