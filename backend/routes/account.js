const express = require('express');
const { authMiddleware } = require('../middleware');
const Account = require('../db');
const router = express.Router();


router.get("/balance", authMiddleware, async (req, res) => {
    const account = await Account.findOne({
        userId: req.userId
    });

    res.json({
        balance: account.balance
    })
});
router.post('/transfer',authMiddleware, async (req, res) => {
    const{amount,to}=req.body;
    const session=await mongoose.startSession();
    session.startTransaction();
    const account=await Account.findOne({userid:req.user.id}).session(session);
    if(!account||!account.balance<amount){
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({error:"Insufficient Transaction"});
    };
    const toAccount=await Account.findOne({userid:to}).session(session);
    if(!toAccount){ 
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({error:"Account not found"});
    }
    await Account.updateOne({userid:req.user.id},{$inc:{balance:-req.body.amount}}).session(session);
    await Account.updateOne({usedid:to},{$inc:{balance:req.body.amount}}).session(session);
    await session.commitTransaction();
    res.json({message:"Transaction Successful"});



});
module.exports = router;