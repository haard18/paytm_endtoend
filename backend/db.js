const mongoose = require('mongoose');
const { ParseStatus } = require('zod');
const { Schema } = mongoose;
require('dotenv').config();

const mongoUrl = process.env.MONGODB_URL;

mongoose.connect(mongoUrl);

const UserSchema = new Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        maxLength: 30,
        minLength: 6
    },
    password: {
        type: String,
        required: true,
        minLength: 6
    },
    firstName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
        maxLength: 50
    }
})
const AccountSchema = new Schema({
    userid: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        requred: true

    },
    balance: {
        type: Number,
        required: true
    },
});
const Account = mongoose.model('Account', AccountSchema);
const User = mongoose.model('User', UserSchema);
module.exports = { User, Account };
//module.exports = mongoose.model('User', UserSchema);