const express = require('express')
const models = require('./ApiRouters/modelApi.js')
const projects = require('./ApiRouters/proyectApi.js')

const api = express.Router()

api.use('/models', models)
api.use('/projects', projects)

module.exports = api