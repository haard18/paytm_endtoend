const express = require('express');
require('dotenv').config();
const UserRouter = require('./user');
const router = express.Router();
const { User } = require('../db');
const { Account } = require('../db');
const jwt = require('jsonwebtoken');
const { authMiddleware } = require('../middleware');
const zod = require('zod');
const JWT_SECRET = process.env.JWT_SECRET;
const signUpBody = zod.object({
    userName: zod.string().min(6).max(30),
    password: zod.string().min(6),
    firstName: zod.string().max(50),
    lastName: zod.string().max(50)
});
router.post('/signup', async (req, res) => {
    const success = signUpBody.safeParse(req.body);
    if (!success) {
        res.status(411).json({ error: "Invalid Inputs" });
        return;
    }
    const existingUser = await User.findOne({ userName: req.body.userName });
    if (existingUser) {
        res.status(411).json({ error: "User already exists" });
        return;
    }
    console.log("before error");
    const dbUser = await User.create(req.body);
    const user = dbUser._id;
    await Account.create({ userid: user, balance: 1 + Math.random() * 10000 });
    const token = jwt.sign({ id: dbUser._id }, JWT_SECRET);
    res.json({ message: "User Created", token: token });
})
const signinBody = zod.object({
    username: zod.string(),
    password: zod.string()
})
router.post('/signin', async (req, res) => {
    const success = signinBody.safeParse(req.body);
    if (!success) {
        res.status(411).json({ error: "Invalid Inputs" });
    }
    try {
        console.log(req.body)
        const user = await User.findOne({ userName: req.body.username });
        console.log(user);
        if (user && user.password === req.body.password) {
            const token = jwt.sign({ id: user._id }, JWT_SECRET);
            return res.json({ message: "User Signed In", token: token });
        }
        
        return res.status(404).json({ error: "User not found" });
    } catch (error) {
        console.error("Error in signin:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
})
const updateBody = zod.object({
    username: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional()
})
router.put('/update', authMiddleware, async (req, res) => {
    const success = updateBody.safeParse(req.body);
    if (!success) {
        res.status(411).json({ error: "Invalid Inputs" });
    }
    const user = await User.findOne({ username: req.body.username });
    if (!user) {
        res.status(404).json({ error: "User not found" });
    }
    await User.update(req.body, { id: req.userId });
    res.json({ message: "User Updated Successfully" });
})
router.get('/bulk', async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            },
        }, {
            lastName: {
                "$regex": filter
            }
        }
        ]
    })
    res.json({
        user: users.map(user => ({
            username: user.userName,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
});


module.exports = router;