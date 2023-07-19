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
        const alreadchoice = await db.collection("choices").findOne({title:title})
        if(alreadchoice){
            return res.sendStatus(409)
        } 
        if(now.getTime() >new  Date(enquete.expireAt).getTime()){
            return res.sendStatus(403)
        }
        await db.collection("choices").insertOne(choice)
        res.status(200).send("foi")
    }catch(err){return res.status(500).send(err.message)}
})
app.get("/poll/:id/choice",async(req,res)=>{
    const identific = req.params.id
    try{
        const choices = await db.collection('choices').find({pollId:identific}).toArray()
        if(choices.length < 1){
            return res.status(404).send("enquete não encotrada no servidor")
        }
        return res.status(200).send(choices)
    }catch(erro){return res.status(500).send(erro.message)}
})

app.post("/choice/:id/vote",async(req,res)=>{
    console.log("voto")
    const option_choosen = req.params.id
    const done_in = dayjs().format("YYYY-MM-DD HH:mm:ss")
    const vote = {option:option_choosen,time:done_in}
    try{
        const choice = await db.collection('choices').findOne({_id:new ObjectId(option_choosen)})
        console.log(choice)
        const enquet = await db.collection("enquetes").findOne({_id:new ObjectId(choice.pollId)})
        console.log(enquet)
        if(new Date(done_in).getTime() > new Date(enquet.expireAt)){
            return res.status(403).send('Não pode ser registrado se a enquete já estiver expirado')
        }
        await db.collection('urna').insertOne(vote)
        return res.sendStatus(200)
    }catch(erro){return res.status(500).send(erro.message)} 

})


app.listen(5000,()=>console.log("api is working"))


