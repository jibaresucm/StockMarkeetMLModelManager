const db = require("./Connections.js")
const handleMySQLErrors = require("../utils/handleMySQlExceptions.js")

class ProjectModelDB{
    constructor(){}

    async linkModelToProject(model_id, project_id){
        let res

        try{
            res = await db.execute('INSERT INTO project_model (model_id, project_id) VALUES (?, ?)', [model_id, project_id])
        }
        catch(error){
            handleMySQLErrors(error.code)
        }
        
        if(!res || res[0].affectedRows == 0) return null
        else return true
    }

    async getModelsFromProject(project_id){
        let res
        try{
            res = await db.execute('SELECT m.* FROM project_model pm JOIN models m ON m.id = pm.model_id WHERE pm.project_id = ?', [project_id])
        }
        catch(error){
            handleMySQLErrors(error.code)
        }
       

        if(res[0].length == 0) return null
        else return res[0]
        
    }
    
}

const projectModelDB = new ProjectModelDB()
module.exports = projectModelDB