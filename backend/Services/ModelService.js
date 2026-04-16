const modelDB  = require("../Database/ModelDB.js")
const authService = require("./AuthService.js")
const { spawn } = require("child_process")
const path = require("path")

const SCRIPTS_DIR = path.resolve(__dirname, "../../scripts")

class ModelService{
    constructor(){}

    async validateTicker(ticker) {
        return new Promise((resolve, reject) => {
            const py = spawn("python", [path.join(SCRIPTS_DIR, "validate_ticker.py"), ticker], { cwd: SCRIPTS_DIR })
            let stdout = ""
            let stderr = ""
            py.stdout.on("data", d => stdout += d)
            py.stderr.on("data", d => stderr += d)
            py.on("close", code => {
                try {
                    const result = JSON.parse(stdout.trim())
                    resolve(result)
                } catch {
                    resolve({ valid: false })
                }
            })
        })
    }

    async train(sId, model_id){
        const userId = await authService.getUserIdFromSession(sId)

        const model = await modelDB.readOnlyUser(userId, model_id)
        if (!model) throw Error("Model not found")

        const modelDict = JSON.stringify({
            ID: model.id,
            STOCK: model.stock,
            PERIOD: model.period,
            MODEL_TYPE: model.model_type,
            HYPERPARAMETERS: model.hyperparameters || {}
        })

        const featuresDict = JSON.stringify(model.features || {})

        const args = [
            path.join(SCRIPTS_DIR, "main.py"),
            "-a", "train",
            "-m", modelDict,
            "-f", featuresDict
        ]

        if (model.optimize_hyperparameters) args.push("--optimize-hyperparameters")

        return new Promise((resolve, reject) => {
            const py = spawn("python", args, { cwd: SCRIPTS_DIR })
            let stdout = ""
            let stderr = ""
            py.stdout.on("data", d => stdout += d)
            py.stderr.on("data", d => stderr += d)
            py.on("close", code => {
                if (code === 0) resolve({ output: stdout })
                else reject(new Error(stderr || "Training failed"))
            })
        })
    }

    async featureAnalysis(sId, data) {
        await authService.getUserIdFromSession(sId)

        const modelDict = JSON.stringify({
            ID: 0,
            STOCK: data.stock,
            PERIOD: data.period,
            MODEL_TYPE: data.model_type,
            HYPERPARAMETERS: {}
        })

        const featuresDict = JSON.stringify(data.features || {})

        const args = [
            path.join(SCRIPTS_DIR, "main.py"),
            "-a", "feature_selection",
            "-m", modelDict,
            "-f", featuresDict
        ]

        if (data.full_dataset) args.push("--full-dataset")

        return new Promise((resolve, reject) => {
            const py = spawn("python", args, { cwd: SCRIPTS_DIR, timeout: 300000 })
            let stdout = ""
            let stderr = ""
            py.stdout.on("data", d => stdout += d)
            py.stderr.on("data", d => stderr += d)
            py.on("close", code => {
                if (code === 0) resolve({ output: stdout })
                else reject(new Error(stderr || "Feature analysis failed"))
            })
        })
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
