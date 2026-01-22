const db = require("../Database/Connections.js")
const handleMySQLErrors = require("../utils/handleMySQlExceptions.js")

class UserDB{
    constructor(){}

    async createUser(username, email, password){

        let res

        try{
            res = await db.execute('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)', [username, email, password])
        }
        catch(error){
            handleMySQLErrors(error.code)
        }
        

        if(!res || res[0].affectedRows == 0) return null
        else return res[0].insertId
    }

    async deleteUser(){}

    async modifyUser(){}

    async readUserById(user_id){

        let res
        try{
            res = await db.execute('SELECT username, email, created_at, password_hash, id FROM users WHERE id = ?', [user_id])
        }
        catch(error){
            handleMySQLErrors(error.code)
        }
       

        if(res[0].length == 0) return null
        else return res[0][0]
    }

    async readUserByUsername(username){

        let res
        try{
            res = await db.execute('SELECT username, email, created_at, password_hash, id FROM users WHERE username = ?', [username])
        }
        catch(error){
            handleMySQLErrors(error.code)
        }


        if(res[0].length == 0) return null
        else return res[0][0]
    }

    async readUserByEmail(email){

       let res

        try{
            res = await db.execute('SELECT username, email, created_at, password_hash, id FROM users WHERE email = ?', [email])
        }
        catch(error){
            handleMySQLErrors(error.code)
        }

        if(res[0].length == 0) return null
        else return res[0][0]
    }
}

const userDB = new UserDB()
module.exports = userDB