const express = require('express')
const path = require('path')
const authService = require("../Services/AuthService.js")
const authValidation = require("../utils/authValidation.js")
const { json } = require('stream/consumers')
const auth = express.Router()

auth.post("/register", (req, res) => {
    const { email, username, password } = req.body;

    if(!authValidation.validatePassword(password)) return res.status(400).send("Invalid password format")
    if(!authValidation.validateEmail(email)) return res.status(400).send("Invalid email format")
    if(!authValidation.validateUsername(username)) return res.status(400).send("Invalid username format")

    
    authService.register(username, email, password)

    .then(id => {
        res.status(200).send("User registered correctly")
        return
    })

    .catch(error => {
        res.status(400).send(error.message)
        return
    })
        
    
})

auth.post("/login", (req, res) => {
    let {username, password} = req.body;

    password = String(password || "")
    username = String(username || "")

    const isEmail = authValidation.validateEmail(username)

    if(!authValidation.validatePassword(password)) return res.status(400).send("Invalid password")
    if(!isEmail && !authValidation.validateUsername(username)) return res.status(400).send("Invalid username or email")

    let email = null

    if(isEmail){
        email = username
        username = null
    }

    //Try the login
    authService.login(username, email, password)

    //If it ends without errors 
    .then(sId =>{
        res.cookie("session_id", sId, {
            httpOnly: true,
            secure: false,
            maxAge: 1000 * 60 * 60 * 24, // 1 day
            sameSite: "lax",
            path: "/"

        })
        res.status(200)
        res.send("Session created susccessfully logged in!!")
        return
    })

    //If error
    .catch(error => {
        res.status(400).send(error.message)
        return
    })
    

})

auth.post("/logout", (req, res) =>{
    let sId =  req.cookies.session_id
    sId = String(sId || "")

    if(!authValidation.validateSId(sId)) return res.status(400).send("Invalid session_id")

    authService.logout(sId)
    
    .then(successful => {
        res.status(200).send("Logged out successfully")
        return
    })
    
    .catch(error => {
        res.status(400).send(error.message)
        return
    })
})

auth.post("/me", (req, res) => {
    let sId =  req.cookies.session_id
    sId = String(sId || "")

    if(!authValidation.validateSId(sId)) return res.status(400).send("Invalid session_id")

    authService.me(sId)
    
    .then(user => {
        res.status(200).json(user)
        return
    })
    
    .catch(error => {
        res.status(400).send(error.message)
        return
    })
})

module.exports = auth