require('dotenv').config();

const jwt_secret=process.env.JWT_SECRET;
module.exports={
    jwt_secret:jwt_secret
}