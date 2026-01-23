const sessionDB = require("../Database/SessionDB.js")
const userDB = require("../Database/UserDB.js")
const bcrypt = require("bcrypt")

const saltRounds = 13

class AuthService{
    constructor(){

    }

    //returns user id
    async register(username, email, password){

        const password_hash = await bcrypt.hash(password, saltRounds)

        const res = await userDB.createUser(username, email, password_hash)

        if(!res) throw Error("Username or email already in use please try again")
        
        return res
    }

    //returns sId
    async login(username, email, password){

        //Compruba q exista user
        let funct
        let id
        if(!username){
            funct = userDB.readUserForLoginByEmail
            id = email
        } 
        else{
            funct = userDB.readUserForLoginByUsername
            id = username
        } 

        //Pilla user
        const res = await funct(id)

        if(!res) throw Error("Couldn't find the specified user")
        
        //Compara contraseñas
        const isMatch = await bcrypt.compare(password, res.password_hash);

        if(!isMatch) throw Error("Incorrect password")

        //Crea la sesión
        const sId = await sessionDB.createSession(res.id)

        if(sId == null) throw Error("Couldn't generate the session")
        
        return sId
    }

    //returns boolean
    async logout(sId){
        const ret = await sessionDB.deleteSession(sId)

        if(!ret) throw Error("Couldn't delete the session")
        
        return ret
    }

    //Returns user json
    async me(sId){

        const ret = await sessionDB.checkSession(sId)

        if(!ret) throw Error("The session doesn't exist. You need to log in!!") //No existe sesion, no existe usuario con esa sesión

        const date = new Date()
        const expiryDate = new Date(ret.expires_at)

        if(expiryDate < date){//Si caducada se borra
            const deleted = await sessionDB.deleteSession(sId)
            if(deleted) throw Error("Session expired, please log in again")
        }

        const user = await userDB.readUserById(ret.user_id)

        if(!user) throw Error("There is no user for that session")

        return user
    }

    async getUserIdFromSession(sId){
        const ret = await sessionDB.checkSession(sId)

        if(!ret) throw Error("The session doesn't exist. You need to log in!!") //No existe sesion, no existe usuario con esa sesión

        const date = new Date()
        const expiryDate = new Date(ret.expires_at)

        if(expiryDate < date){//Si caducada se borra
            const deleted = await sessionDB.deleteSession(sId)
            if(deleted) throw Error("Session expired, please log in again")
        }

        return ret.user_id
    }



}

const authService = new AuthService()

module.exports =  authService