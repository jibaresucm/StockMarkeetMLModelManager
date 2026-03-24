const db = require("./Connections.js")
const handleMySQLErrors = require("../utils/handleMySQlExceptions.js")
const Project = require("./TransferObjects/Project.js")


class ProjectDB{
    constructor(){}

    //Returns id or null
    async create(project){
        let res

        try{
            res = await db.execute('INSERT INTO projects (user_id, name, description) VALUES (?, ?, ?)', [project.user_id, project.name, project.description])
        }
        catch(error){
            handleMySQLErrors(error.code)
        }
        

        if(!res || res[0].affectedRows == 0) return null
        else return res[0].insertId
    }

    //returns boolean
    async delete(project_id){
        let res

        try{
            res = await db.execute('DELETE FROM projects WHERE id = ?', [project_id])
        }
        catch(error){
            handleMySQLErrors(error.code)
        }


        if(res[0].affectedRows == 1) return true
        else return false
    }

    async deleteOnlyUser(user_id, project_id){
        let res

        try{
            res = await db.execute('DELETE FROM projects WHERE id = ? AND user_id = ?', [project_id, user_id])
        }
        catch(error){
            handleMySQLErrors(error.code)
        }


        if(res[0].affectedRows == 1) return true
        else return false
    }

    //returns boolean
    async modify(project){
        let res

        try{
            res = await db.execute('UPDATE projects SET name = ?, description = ? WHERE id = ? AND user_id = ?', [project.name, project.description, project.id, project.user_id])
        }
        catch(error){
            handleMySQLErrors(error.code)
        }

        if(res[0].affectedRows == 1) return true
        else return false
    }

    //returns project
    async read(project_id){
        let res
        try{
            res = await db.execute('SELECT * FROM projects WHERE id = ?', [project_id])
        }
        catch(error){
            handleMySQLErrors(error.code)
        }
       

        if(res[0].length == 0) return null
        else{
            res = res[0][0]

            return new Project(res.id, res.name, res.description, res.user_id, res.created_at)
        }
        
    }

    async readOnlyUser(user_id, project_id){
        let res
        try{
            res = await db.execute('SELECT * FROM projects WHERE id = ? AND user_id = ?', [project_id, user_id])
        }
        catch(error){
            handleMySQLErrors(error.code)
        }
       

        if(res[0].length == 0) return null
        else{
            res = res[0][0]

            return new Project(res.id, res.name, res.description, res.user_id, res.created_at)
        }
        
    }

    //returns null or list of
    async readFromUser(user_id){

        let res
        try{
            res = await db.execute('SELECT * FROM projects WHERE user_id = ?', [user_id])
        }
        catch(error){
            handleMySQLErrors(error.code)
        }
       
        if(res[0].length == 0) return null
        else return res[0]
    }
}

const projectDB = new ProjectDB()

module.exports = projectDB