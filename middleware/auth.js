require('dotenv').config()
const jwt = require('jsonwebtoken')
const {User,sequelize} = require('../models')
const access_key = process.env.ACCESS_TOKEN;
const auth = async(req, res, next) =>{
       
        try {

            const header = req.headers['authorization']
            const token = header && header.split(' ')[1]
            if (!token) return res.status(401).send({  message: 'No token provided.' });
            const decoded = jwt.verify(token,access_key)
    
            const user = await User.findByPk(decoded.id)
            if(!user){
                throw new Error()
            }
            req.user = user
            next()
        }catch(err){

        }
      


        
    
}

module.exports = auth