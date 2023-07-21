
import { Router } from "express"
import { db } from "../database/mongoclient.js"
import {ObjectId} from "mongodb"
import dayjs from "dayjs"

const votes = Router()
votes.post("/choice/:id/vote",async(req,res)=>{
    const option_choosen = req.params.id
    const done_in = dayjs().format("YYYY-MM-DD HH:mm:ss")
    const vote = {choiceId:option_choosen,createdAt:done_in}
    try{
        const choice = await db.collection('choices').findOne({_id:new ObjectId(option_choosen)})
        vote.pull = choice
        const enquet = await db.collection("enquetes").findOne({_id:new ObjectId(choice.pollId)})
        vote.pull = enquet._id
        if(new Date(done_in).getTime() > new Date(enquet.expireAt)){
            return res.status(403).send('Não pode ser registrado se a enquete já estiver expirado')
        }
        await db.collection('urna').insertOne(vote)
        return res.sendStatus(201)
    }catch(erro){return res.status(500).send(erro.message)} 
})

votes.get("/poll/:id/result",async(req,res)=>{
    const poll = req.params.id
    try{
        const choices = await db.collection("choices").find({pollId:poll}).toArray()
        if(choices.length < 1){
            return res.status(403).send("não tem enquete com este id no banco")
        }
        const options = await choices.map(async(option)=>{
            try{
                const vote = await db.collection('urna').find({choiceId:option._id.toString()}).toArray()
                const result = {title:option.title,votes: vote.length}
                return result
            }catch(erro){return erro.messages}
            })
        const result = await Promise.all(options)
        const ordenado = result.sort((a,b)=>b.votes-a.votes)
        console.log(ordenado)
        return res.send(ordenado[0])
        

    }catch(erro){return res.status(500).send(erro.message)}
})

export default votes