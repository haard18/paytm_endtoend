const express=require('express');
const router=express.Router();
const UserRouter=require('./user');
const accountRouter=require('./account');
router.use("/user",UserRouter);
router.use("/account", accountRouter);

module.exports=router;