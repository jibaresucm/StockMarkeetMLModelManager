const express = require('express')
const models = require('./ApiRouters/modelApi.js')
const projects = require('./ApiRouters/proyectApi.js')
const newsApi = require("./ApiRouter/newsApi.js")


const api = express.Router()

api.use('/models', models)
api.use('/projects', projects)
api.use('/news', newsApi)

module.exports = api