const projectDB  = require("../Database/ProjectDB.js")
const modelDB  = require("../Database/ModelDB.js")
const projectModelDB = require("../Database/ProjectModelDB.js")
const authService = require("./AuthService.js")

class ProjectService{
    constructor(){}

    async read(sId, project_id){
        const id = await authService.getUserIdFromSession(sId) // Verifica id del usuario, lanza errores si no hay

        const res = await projectDB.readOnlyUser(id, project_id)

        if(!res) throw Error("Couldn't find project of that id for your user")

        return res
    }

    async create(sId, project){
        const id = await authService.getUserIdFromSession(sId) // Verifica id del usuario, lanza errores si no hay

        project.user_id = id

        const created = await projectDB.create(project)
        
        if(!created) throw Error("Couldn't create a new project please try again")
        
        return created
    }

    async delete(sId, project_id){
        const id = await authService.getUserIdFromSession(sId) // Verifica id del usuario, lanza errores si no hay

        const deleted = await projectDB.deleteOnlyUser(id, project_id)

        if(!deleted) throw Error("Couldn't find project of that id for your user")

        return true
    }

    async modify(sId, project){
        const id = await authService.getUserIdFromSession(sId) // Verifica id del usuario, lanza errores si no hay

        project.user_id = id

        const updated = await projectDB.modify(project)

        if(!updated) throw Error("Couldn't update project. Check it exists and belongs to your user.")

        return true
    }

    async readFromUser(sId){
        const id = await authService.getUserIdFromSession(sId) // Verifica id del usuario, lanza errores si no hay

        const list = await projectDB.readFromUser(id)

        if(!list) throw Error("This user does not have any projects")

        return list
    }

    async linkModelToProject(sId, model_id, project_id){
        const id = await authService.getUserIdFromSession(sId) // Verifica id del usuario, lanza errores si no hay

        const model = await modelDB.read(model_id)

        if(!model) throw Error("There is no model with that id")
        if(model.user_id != id) throw Error("That model is not owned by the user requesting the link")

        const project = await projectDB.read(project_id)

        if(!project) throw Error("There is no project with that id")
        if(project.user_id != id) throw Error("That project is not owned by the user requesting the link")

        const res = await projectModelDB.linkModelToProject(model_id, project_id)

        if(!res) throw Error("Couldn't link model and project together")

        return true


    }

    async getModelsFromProject(sId, project_id){
        const id = await authService.getUserIdFromSession(sId) // Verifica id del usuario, lanza errores si no hay

        const project = await projectDB.read(project_id)

        if(!project) throw Error("There is no project with that id")
        if(project.user_id != id) throw Error("That project is not owned by the user requesting the link")

        const list = await projectModelDB.getModelsFromProject(project_id)

        if(!list) throw Error("This project does not have any models")

        return list
    }
}

const projectService = new ProjectService()

module.exports = projectService