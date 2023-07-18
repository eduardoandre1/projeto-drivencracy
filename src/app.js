import  express  from "express";
import { MongoClient } from "mongodb";
import  cors from "cors";
import dotenv from "dotenv";
import dayjs from "dayjs";

//url encrypty
dotenv.config()
//

// Api construção
const app = express()
app.use(cors())
app.use(express.json())

//Server mongo reading and editing by api
const mongoClient = new MongoClient(process.env.DATABASE_URL);
let db ;
mongoClient.connect()
.then(() => {db = mongoClient.db();console.log("server is working")})
.catch((err) => console.log(err.message,"server offline"));

app.post("/poll",async (req,res)=>{
    const [title,expireAt] = req.body
    console.log(title,expireAt)
    const enquete ={title:title,expireAt:expireAt}
    if(!title){
        return res.sendStatus(422)
    }
    if(!expireAt){
        enquete.expireAt = dayjs().add(30,'day').format("YYYY-MM-DD HH:mm")
    }
    try{
        await db.collection("enquetes").insertOne(enquete)
        return res.sendStatus(201)
    }catch(err){
        return res.status(500).send(err.message)
    }
})

app.listen(5000,()=>console.log("api is working"))


