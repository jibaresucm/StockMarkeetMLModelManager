const passwordLength = 6
const usernameLength = 3
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

class AuthValidation{
    constructor(){}

    validateEmail(email){

        if(!email) return false

        if(!emailRegex.test(email)) return false

        return true
    }

    validatePassword(password){
        
        if(!password) return false

        if(password.length < passwordLength) return false

        return true
    }

    validateUsername(username){
        if(!username) return false

        if(username.length < usernameLength) return false

        return true
    }

    validateSId(sId){
        if(!sId) return false

        return true
    }
}

const authValidation = new AuthValidation()

module.exports = authValidation