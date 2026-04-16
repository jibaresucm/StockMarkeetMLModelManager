const db = require("./Connections.js")
const handleMySQLErrors = require("../utils/handleMySQlExceptions.js")
const Model = require("./TransferObjects/Model.js")


class ModelDB{
    constructor(){}

    //Returns id or null
    async create(model){
        let res

        try{
            res = await db.execute(
                'INSERT INTO models (user_id, name, description, stock, period, model_type, features, hyperparameters, optimize_hyperparameters) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
                [model.user_id, model.name, model.description, model.stock, model.period, model.model_type,
                 model.features ? JSON.stringify(model.features) : null,
                 model.hyperparameters ? JSON.stringify(model.hyperparameters) : null,
                 model.optimize_hyperparameters ? 1 : 0]
            )
        }
        catch(error){
            handleMySQLErrors(error.code)
        }


        if(!res || res[0].affectedRows == 0) return null
        else return res[0].insertId
    }

    //returns boolean
    async delete(model_id){
        let res

        try{
            res = await db.execute('DELETE FROM models WHERE id = ?', [model_id])
        }
        catch(error){
            handleMySQLErrors(error.code)
        }


        if(res[0].affectedRows == 1) return true
        else return false
    }


    async deleteOnlyUser(user_id, model_id){
        let res

        try{
            res = await db.execute('DELETE FROM models WHERE id = ? AND user_id = ?;', [model_id, user_id])
        }
        catch(error){
            handleMySQLErrors(error.code)
        }


        if(res[0].affectedRows == 1) return true
        else return false
    }

    //returns boolean
    async modify(model){
        let res

        try{
            res = await db.execute(
                'UPDATE models SET name = ?, description = ?, model_type = ?, features = ?, hyperparameters = ?, optimize_hyperparameters = ? WHERE id = ? AND user_id = ?',
                [model.name, model.description, model.model_type || null,
                 model.features ? JSON.stringify(model.features) : null,
                 model.hyperparameters ? JSON.stringify(model.hyperparameters) : null,
                 model.optimize_hyperparameters ? 1 : 0,
                 model.id, model.user_id]
            )
        }
        catch(error){
            handleMySQLErrors(error.code)
        }

        if(res[0].affectedRows == 1) return true
        else return false
    }

    //returns model
    async read(model_id){
        let res
        try{
            res = await db.execute('SELECT * FROM models WHERE id = ?', [model_id])
        }
        catch(error){
            handleMySQLErrors(error.code)
        }
       

        if(res[0].length == 0) return null
        else{
            res = res[0][0]

            return new Model(res.id, res.name, res.description, res.user_id, res.stock, res.period, res.model_type, res.created_at, res.features, res.hyperparameters, res.optimize_hyperparameters)
        }

    }

    async readOnlyUser(user_id ,model_id){
        let res
        try{
            res = await db.execute('SELECT * FROM models WHERE id = ? AND user_id = ?', [model_id, user_id])
        }
        catch(error){
            handleMySQLErrors(error.code)
        }


        if(res[0].length == 0) return null
        else{
            res = res[0][0]

            return new Model(res.id, res.name, res.description, res.user_id, res.stock, res.period, res.model_type, res.created_at, res.features, res.hyperparameters, res.optimize_hyperparameters)
        }
        
    }

    //returns null or list of
    async readFromUser(user_id){

        let res
        try{
            res = await db.execute('SELECT * FROM models WHERE user_id = ?', [user_id])
        }
        catch(error){
            handleMySQLErrors(error.code)
        }

        if(res[0].length == 0) return null
        else return res[0].map(r => new Model(r.id, r.name, r.description, r.user_id, r.stock, r.period, r.model_type, r.created_at, r.features, r.hyperparameters, r.optimize_hyperparameters))
    }
}

const modelDB = new ModelDB()

module.exports = modelDB