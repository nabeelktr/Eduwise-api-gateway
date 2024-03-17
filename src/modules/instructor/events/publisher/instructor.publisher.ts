import * as amqp from 'amqplib'
import 'dotenv/config'
import { registerBody } from '../interfaces/Iinstructor';


const publisher = async (queue: string, data: {}) => {
    try {
        const Url = process.env.RabbitMQ_Link as string;
        const connection = await amqp.connect(Url)
        const channel = await connection.createChannel()
        await channel.assertQueue(queue)
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)))
        await channel.close()
        await connection.close()
    } catch (error) {
        console.log(error)
    }
}


export  default {
    //sending data from api-gateway to instructor service
    registerInstructor : async(data: registerBody) => {
        try{
        const queue = 'register-instructor';
        publisher(queue, data);
        }catch(e:any){
            console.log(e);
        }
    }

}