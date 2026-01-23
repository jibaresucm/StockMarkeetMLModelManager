const express = require('express')

const models = express.Router()

//All of these are methods that need authentication, a model can't be accesed or modified by someone that doesn't own it

//Sends id, trains selected model on its parameters
models.post("/:id/train", (req, res) =>{
    
})

models.post("/create", (req, res) =>{
    
})

models.post("/:id/delete", (req, res) =>{
    
})

models.post("/:id/modify", (req, res) =>{
    
})

models.get("/:id/read", (req, res) =>{
    
})

models.get("/readFromUser", (req, res) => {

})
module.exports = models