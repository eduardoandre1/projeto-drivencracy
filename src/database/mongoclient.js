import { MongoClient} from "mongodb";
import dotenv from "dotenv";

dotenv.config()

const mongoClient = new MongoClient(process.env.DATABASE_URL);
try{
    await mongoClient.connect()
    console.log("server is working")
}catch(erro){console.log("server ploblem: ",erro.message)}

export const db = mongoClient.db();

