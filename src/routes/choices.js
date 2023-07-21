import { Router } from "express";
import { ObjectId } from "mongodb"
import { db } from "../database/mongoclient.js";

const choices = Router()
choices.post("/choice",async (req,res)=>{
    const {title,pollId} = req.body
    const now = new Date()
    const choice = {title:title,pollId:pollId}
    if(!title || !pollId){
        return res.sendStatus(422)
    }
    try{
        const enquete = await db.collection("enquetes").findOne({_id:new ObjectId(pollId)})
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
        res.status(201).send("create")
    }catch(err){return res.status(500).send(err.message)}
})
choices.get("/poll/:id/choice",async(req,res)=>{
    const identific = req.params.id
    try{
        const choices = await db.collection('choices').find({pollId:identific}).toArray()
        if(choices.length < 1){
            return res.status(404).send("enquete não encotrada no servidor")
        }
        return res.status(200).send(choices)
    }catch(erro){return res.status(500).send(erro.message)}
})

export default choices