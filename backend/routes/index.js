const express=require('express');
const router=express.Router();

router.use('/user',UserRouter);

module.exports=router;