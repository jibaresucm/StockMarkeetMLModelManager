const modelDB  = require("../Database/ModelDB.js")
const authService = require("./AuthService.js")

class ModelService{
    constructor(){}

    async train(sId, model_id){
        const id = await authService.getUserIdFromSession(sId) // Verifica id del usuario, lanza errores si no hay
    }

    async predict(sId, model_id){
        const id = await authService.getUserIdFromSession(sId) // Verifica id del usuario, lanza errores si no hay
    }

    async read(sId, model_id){
        const id = await authService.getUserIdFromSession(sId) // Verifica id del usuario, lanza errores si no hay

        const res = await modelDB.readOnlyUser(id, model_id)

        if(!res) throw Error("Couldn't find model of that id for your user")

        return res
    }

    async create(sId, model){
        const id = await authService.getUserIdFromSession(sId) // Verifica id del usuario, lanza errores si no hay

        model.user_id = id

        const created = await modelDB.create(model)
        
        if(!created) throw Error("Couldn't create a new model please try again")
        
        return created
    }

    async delete(sId, model_id){
        const id = await authService.getUserIdFromSession(sId) // Verifica id del usuario, lanza errores si no hay

        const deleted = await modelDB.deleteOnlyUser(id, model_id)

        if(!deleted) throw Error("Couldn't find model of that id for your user")

        return true
    }

    async modify(sId, model){
        const id = await authService.getUserIdFromSession(sId) // Verifica id del usuario, lanza errores si no hay

        model.user_id = id

        const updated = await modelDB.modify(model)

        if(!updated) throw Error("Couldn't update model. Check it exists and belongs to your user.")

        return true
    }

    async readFromUser(sId){
        const id = await authService.getUserIdFromSession(sId) // Verifica id del usuario, lanza errores si no hay

        const list = await modelDB.readFromUser(id)

        if(!list) throw Error("This user does not have any models")

        return list
    }
}

const modelService = new ModelService()

module.exports = modelService
