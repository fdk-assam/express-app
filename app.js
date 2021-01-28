const express = require('express')
const app = express()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const auth = require('./middleware/auth')
const { User, Post, sequelize } = require('./models')
require('dotenv').config()
app.use(express.json())

app.get('/',(req,res)=>{
    res.send('Hello Nodejs')
})

app.post('/users/register', async (req, res) => {

    const { name, email, password, role } = req.body
    hashedPassword = await bcrypt.hash(password, 8)
    try {
        const user = await User.create({ name, email, password: hashedPassword, role })
        res.status(201).send(user)
    } catch (e) {
        res.status(500).send(e)
    }
})

app.post('/users/login', async (req, res) => {
    const { email, password } = req.body

    try {
        const user = await User.findOne({
            where: {
                email
            }
        });
        if(!user){
            res.json('Message: User Not Found')
        }
        const isMatch = await bcrypt.compare(password, user.password)
        if(!isMatch){
            res.json('Message: Wrong Password')
        }
        const token = jwt.sign({id: user.id},'secret')
        res.status(200).json({token})
    } catch (e) {
        res.status(500).send(e)
    }
})

app.get('/me',auth, async (req, res)=>{
    res.send(req.user)
})

app.get('/users',auth, async (req, res) => {
    const users = await User.findAll()

    try {

        res.status(200).json(users)
    } catch (e) {
        res.status(500).send(e)
    }
})

app.post('/users/:id',auth,async (req, res) => {

    const id = req.params.id

    try {

        const user = await User.findByPk(id)
        res.status(200).send(user)

    } catch (e) {
        res.status(500).send(e)
    }

})

app.post('/posts',auth,async (req, res) => {

    const { userId, body } = req.body
    try {
        const user = await Post.create({ body, userId: userId })
        res.status(201).send(user)
    } catch (e) {
        res.status(500).send(e)
    }
})

app.get('/posts',auth, async (req, res) => {
    try {
        const posts = await Post.findAll({ include: ['User'] })
        res.send(posts)

    } catch (e) {
        res.status(500).send(e)
    }
})

app.get('/users/:uuid',auth,async(req, res)=>{

    const uuid = req.params.uuid
    const user = await User.findOne({
        where: {
            uuid
        }
    })
    if(req.body){
        user.name= req.body.name
        user.email= req.body.email
        user.save()
    }
    
    res.send({data:user})
  

})



app.listen(process.env.PORT,()=>{
    console.log(`Server is Running On Port:${process.env.PORT}`)
})

