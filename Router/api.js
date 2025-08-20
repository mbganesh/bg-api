import express from "express";
import PeopleSchema from '../Schema/PeoplesSchema.js'
const router = express.Router()

router.use(express.json())


router.get('/' , async (req , res)=> {
    // let allData = await PeopleSchema.find({})
    // res.send(allData)
    res.send('🤡 is working....')
})


export default router