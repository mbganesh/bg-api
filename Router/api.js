import express from "express";
const router = express.Router()

router.use(express.json())


router.get('/' , async (req , res)=> {
    res.send('🤡 is working....')
})


export default router