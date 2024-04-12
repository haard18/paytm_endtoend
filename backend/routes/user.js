const express = require('express');
const UserRouter = require('./user');
const router = express.Router();
const User = require('../db');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config');
const zod = require('zod');
const { authMiddleware } = require('../middleware');
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
    }
    const existingUser = User.findOne({ username: req.body.userName });
    if (existingUser) {
        res.status(409).json({ error: "User already exists" });
    }
    const dbUser = await User.create(req.body);
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
    const user = await User.findOne({ username: req.body.username });
    if (user) {
        const token = jwt.sign({ id: user._id }, JWT_SECRET);

        res.json({ message: "User Signed In", token: token });
    }
    res.status(411).json({ error: "Error while Logging in" });
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
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
});


module.exports = router;