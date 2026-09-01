const modelDB  = require("../Database/ModelDB.js")
const authService = require("./AuthService.js")
const pyRequest = require("../utils/pythonRequest.js")

class ModelService{
    constructor(){}

    async validateTicker(ticker) {
        try {
            const r = await pyRequest("GET", `/check_stock/${encodeURIComponent(ticker)}`)
            return { valid: !!r.available }
        } catch (err) {
            if (err.status === 400) return { valid: false, reason: err.message }
            throw err
        }
    }

    async train(sId, model_id){
        const userId = await authService.getUserIdFromSession(sId)

        const model = await modelDB.readOnlyUser(userId, model_id)
        if (!model) throw Error("Model not found")

        const body = {
            id: model.id,
            ticker: model.stock,
            period: model.period,
            objective: { TARGET: model.target, SAMPLING: model.sampling },
            dataset: model.features || {},
            model_type: model.model_type,
            hyperparameters: model.hyperparameters || undefined,
            optimize_hyperparameters: !!model.optimize_hyperparameters,
        }

        return await pyRequest("POST", "/train", body)
    }

    async featureAnalysis(sId, data) {
        await authService.getUserIdFromSession(sId)

        const body = {
            ticker: data.stock,
            period: data.period,
            objective: { TARGET: data.target, SAMPLING: data.sampling },
            dataset: data.features || null,
            sample_dataset: !!data.full_dataset,
        }

        const kind = data.kind || "mutual_information"
        return await pyRequest("GET", `/${kind}`, body)
    }

    async predict(sId, model_id){
        const userId = await authService.getUserIdFromSession(sId)

        const model = await modelDB.readOnlyUser(userId, model_id)
        if (!model) throw Error("Model not found")

        const body = {
            id: model.id,
            ticker: model.stock,
            model_type: model.model_type,
            objective: { TARGET: model.target, SAMPLING: model.sampling },
            dataset: model.features || {},
        }

        return await pyRequest("POST", "/predict", body)
    }

    async stats(sId, model_id){
        const userId = await authService.getUserIdFromSession(sId)

        const model = await modelDB.readOnlyUser(userId, model_id)
        if (!model) throw Error("Model not found")

        return await pyRequest("GET", `/model_stats/${model.id}`)
    }

    async getOptions(sId){
        await authService.getUserIdFromSession(sId)
        const [features, targets, samplings, models] = await Promise.all([
            pyRequest("GET", "/features"),
            pyRequest("GET", "/targets"),
            pyRequest("GET", "/event_samplings"),
            pyRequest("GET", "/model_types"),
        ])
        return {
            features: features.features,
            targets: targets.targets,
            sampling_methods: samplings.sampling_methods,
            model_types: models.models,
        }
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

        // If no model_type provided, read existing to preserve it
        if (!model.model_type) {
            const existing = await modelDB.readOnlyUser(id, model.id)
            if (existing) model.model_type = existing.model_type
        }

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
