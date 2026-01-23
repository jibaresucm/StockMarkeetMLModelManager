const generateSessionId = require("../utils/sessionGenerator.js")
const db = require("./Connections.js")
const handleMySQLErrors = require("../utils/handleMySQlExceptions.js")

const session_duration = 24

class SessionsDB{
    constructor(){
        
    }

    //Returns user_id and expires_at, null if it doesn't exist
    async checkSession(sId){

        let res
        try{
            res = await db.execute('SELECT user_id, expires_at FROM sessions WHERE session_id = ?', [sId])
        }
        catch(error){
            handleMySQLErrors(error.code)
        }


        if(res[0].length == 0) return null
        else return res[0][0]

    }

    //Creates session only if user exists and sId is not repeated 3 times in a row, else null
    async createSession(userId){

        const expiresAt = new Date()
        expiresAt.setHours(expiresAt.getHours() + session_duration)

        let i
        let sId
        for(i = 0; i < 3; i++){
            sId = generateSessionId()
            try{
                await db.execute('INSERT INTO sessions (session_id, user_id, expires_at) VALUES (?, ?, ?)', [sId, userId, expiresAt])
                break
            }
            catch(error){
                handleMySQLErrors(error.code)
            }
          
        }

        if(i != 3) return sId
        else return null
    }

    //Delete session if exists returns true if successful false if not
    async deleteSession(sId){

        let res
        try{
            res = await db.execute('DELETE FROM sessions WHERE session_id = ?', [sId])
        }
        catch(error){
            handleMySQLErrors(error.code)
        }


        if(res[0].affectedRows == 1) return true
        else return false


    }
}

const sessionsDB = new SessionsDB()

module.exports = sessionsDB