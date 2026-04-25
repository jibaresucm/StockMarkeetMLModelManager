const express = require('express')
const modelService = require('../../Services/ModelService.js')

const models = express.Router()

//All of these are methods that need authentication, a model can't be accesed or modified by someone that doesn't own it

// Validate a stock ticker using yfinance
models.post("/validate-ticker", (req, res) => {
    const sId = String(req.cookies.session_id || "")
    if (!sId) return res.status(400).send("Not authenticated")

    const { ticker } = req.body
    if (!ticker) return res.status(400).send("ticker is required")

    modelService.validateTicker(ticker)
        .then(result => res.status(200).json(result))
        .catch(error => res.status(400).send(error.message))
})

// Run feature analysis
models.post("/feature-analysis", (req, res) => {
    const sId = String(req.cookies.session_id || "")
    if (!sId) return res.status(400).send("Not authenticated")

    const { stock, period, model_type, features, full_dataset } = req.body
    if (!stock || !period || !model_type) {
        return res.status(400).send("stock, period, and model_type are required")
    }

    modelService.featureAnalysis(sId, { stock, period: parseInt(period), model_type, features, full_dataset })
        .then(result => res.status(200).json(result))
        .catch(error => res.status(400).send(error.message))
})

//Sends id, trains selected model on its parameters
models.post("/:id/train", (req, res) =>{
    const sId = String(req.cookies.session_id || "")
    if (!sId) return res.status(400).send("Not authenticated")

    const model_id = parseInt(req.params.id)
    if (isNaN(model_id)) return res.status(400).send("Invalid model id")

    modelService.train(sId, model_id)
        .then(result => res.status(200).json(result))
        .catch(error => res.status(400).send(error.message))

})

models.post("/create", (req, res) =>{
    const sId = String(req.cookies.session_id || "")
    if (!sId) return res.status(400).send("Not authenticated")

    const { name, description, stock, period, model_type, features, hyperparameters, optimize_hyperparameters } = req.body
    if (!name || !stock || !period || !model_type) {
        return res.status(400).send("name, stock, period, and model_type are required")
    }

    const model = {
        name, description, stock, period: parseInt(period), model_type,
        features: features || null,
        hyperparameters: hyperparameters || null,
        optimize_hyperparameters: optimize_hyperparameters ? 1 : 0
    }

    modelService.create(sId, model)
        .then(id => res.status(200).json({ id }))
        .catch(error => res.status(400).send(error.message))

})

models.post("/:id/delete", (req, res) =>{
    const sId = String(req.cookies.session_id || "")
    if (!sId) return res.status(400).send("Not authenticated")

    const model_id = parseInt(req.params.id)
    if (isNaN(model_id)) return res.status(400).send("Invalid model id")

    modelService.delete(sId, model_id)
        .then(() => res.status(200).send("Model deleted"))
        .catch(error => res.status(400).send(error.message))    
})

models.post("/:id/modify", (req, res) =>{
    const sId = String(req.cookies.session_id || "")
    if (!sId) return res.status(400).send("Not authenticated")

    const model_id = parseInt(req.params.id)
    if (isNaN(model_id)) return res.status(400).send("Invalid model id")

    const { name, description, model_type, features, hyperparameters, optimize_hyperparameters } = req.body
    if (!name) return res.status(400).send("name is required")

    const model = {
        id: model_id, name, description, model_type,
        features: features || null,
        hyperparameters: hyperparameters || null,
        optimize_hyperparameters: optimize_hyperparameters ? 1 : 0
    }

    modelService.modify(sId, model)
        .then(() => res.status(200).send("Model updated"))
        .catch(error => res.status(400).send(error.message))

})

models.get("/:id/read", (req, res) =>{
    const sId = String(req.cookies.session_id || "")
    if (!sId) return res.status(400).send("Not authenticated")

    const model_id = parseInt(req.params.id)
    if (isNaN(model_id)) return res.status(400).send("Invalid model id")

    modelService.read(sId, model_id)
        .then(model => res.status(200).json(model))
        .catch(error => res.status(400).send(error.message))    
})

models.get("/readFromUser", (req, res) => {
    const sId = String(req.cookies.session_id || "")
    if (!sId) return res.status(400).send("Not authenticated")

    modelService.readFromUser(sId)
        .then(list => res.status(200).json(list))
        .catch(error => res.status(400).send(error.message))
})
module.exports = models