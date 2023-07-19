import  express  from "express";
import { MongoClient, ObjectId } from "mongodb";
import  cors from "cors";
import dotenv from "dotenv";
import dayjs from "dayjs";
import  date  from "joi";

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
    const {title,expireAt} = req.body
    const enquete ={title:title,expireAt:expireAt}
    if(!title){
        return res.sendStatus(422)
    }
    if(!expireAt){
        enquete.expireAt = dayjs().add(30,'day').format("YYYY-MM-DD HH:mm:ss")
    }
    try{
        enquete.expireAt = new Date(enquete.expireAt)
        await db.collection("enquetes").insertOne(enquete)
        return res.sendStatus(201)
    }catch(err){
        return res.status(500).send(err.message)
    }
})

app.get("/poll",async (req,res)=>{
    try{
        const list_enquetes = await db.collection('enquetes').find().toArray()
        return res.status(200).send(list_enquetes)
    }catch(err){return res.status(500).send(err.message)}
})

app.post("/choice",async (req,res)=>{
    const {title,pollId} = req.body
    const now = new Date()
    const choice = {title:title,pollId:pollId}
    if(!title || !pollId){
        return res.sendStatus(422)
    }
    try{
        const enquete = await db.collection("enquetes").findOne({_id:new ObjectId(pollId)})
        console.log(enquete.expireAt )
        if(!enquete){
            return res.sendStatus(404)
        }
        const choice = await db.collection("choices").findOne({title:title})
        if(choice){
            return res.sendStatus(409)
        }
        console.log(enquete.expireAt)
        console.log(new Date(enquete.expireAt))
        console.log(now)
        if(now.getTime() >new  Date(enquete.expireAt).getTime()){
            return res.sendStatus(403)
        }
        await db.collection("choices").insertOne(choice)
        res.status(200).send("foi")
    }catch(err){return res.status(500).send(err.message)}
})



app.listen(5000,()=>console.log("api is working"))


