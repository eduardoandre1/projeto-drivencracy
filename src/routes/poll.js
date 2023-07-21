import { Router } from "express"
import dayjs from "dayjs"
import { db } from "../database/mongoclient.js"
const poll = Router()
poll.post("/poll",async (req,res)=>{
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

poll.get("/poll",async (req,res)=>{
    try{
        const list_enquetes = await db.collection('enquetes').find().toArray()
        return res.status(200).send(list_enquetes)
    }catch(err){return res.status(500).send(err.message)}
})

export default poll
