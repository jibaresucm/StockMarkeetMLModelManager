const express = require('express')
const projectService = require('../../Services/ProjectService.js')

const projects = express.Router()

projects.get("/readFromUser", (req, res) => {
    const sId = String(req.cookies.session_id || "")
    if (!sId) return res.status(400).send("Not authenticated")

    projectService.readFromUser(sId)
        .then(list => res.status(200).json(list))
        .catch(error => res.status(400).send(error.message))
})

projects.get("/:id/read", (req, res) => {
    const sId = String(req.cookies.session_id || "")
    if (!sId) return res.status(400).send("Not authenticated")

    const project_id = parseInt(req.params.id)
    if (isNaN(project_id)) return res.status(400).send("Invalid project id")

    projectService.read(sId, project_id)
        .then(project => res.status(200).json(project))
        .catch(error => res.status(400).send(error.message))
})

projects.post("/create", (req, res) => {
    const sId = String(req.cookies.session_id || "")
    if (!sId) return res.status(400).send("Not authenticated")

    const { name, description } = req.body
    if (!name) return res.status(400).send("name is required")

    const project = { name, description }

    projectService.create(sId, project)
        .then(id => res.status(200).json({ id }))
        .catch(error => res.status(400).send(error.message))
})

projects.post("/:id/delete", (req, res) => {
    const sId = String(req.cookies.session_id || "")
    if (!sId) return res.status(400).send("Not authenticated")

    const project_id = parseInt(req.params.id)
    if (isNaN(project_id)) return res.status(400).send("Invalid project id")

    projectService.delete(sId, project_id)
        .then(() => res.status(200).send("Project deleted"))
        .catch(error => res.status(400).send(error.message))
})

projects.post("/:id/modify", (req, res) => {
    const sId = String(req.cookies.session_id || "")
    if (!sId) return res.status(400).send("Not authenticated")

    const project_id = parseInt(req.params.id)
    if (isNaN(project_id)) return res.status(400).send("Invalid project id")

    const { name, description } = req.body
    if (!name) return res.status(400).send("name is required")

    const project = { id: project_id, name, description }

    projectService.modify(sId, project)
        .then(() => res.status(200).send("Project updated"))
        .catch(error => res.status(400).send(error.message))
})

projects.get("/:id/models", (req, res) => {
    const sId = String(req.cookies.session_id || "")
    if (!sId) return res.status(400).send("Not authenticated")

    const project_id = parseInt(req.params.id)
    if (isNaN(project_id)) return res.status(400).send("Invalid project id")

    projectService.getModelsFromProject(sId, project_id)
        .then(list => res.status(200).json(list))
        .catch(error => res.status(400).send(error.message))
})

projects.post("/:id/link", (req, res) => {
    const sId = String(req.cookies.session_id || "")
    if (!sId) return res.status(400).send("Not authenticated")

    const project_id = parseInt(req.params.id)
    if (isNaN(project_id)) return res.status(400).send("Invalid project id")

    const model_id = parseInt(req.body.model_id)
    if (isNaN(model_id)) return res.status(400).send("Invalid model id")

    projectService.linkModelToProject(sId, model_id, project_id)
        .then(() => res.status(200).send("Model linked to project"))
        .catch(error => res.status(400).send(error.message))
})

module.exports = projects
