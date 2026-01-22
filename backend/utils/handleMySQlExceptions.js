
//Only handles db errors
function handleMySQLErrors(code){
    switch(code){
        case 'ECONNREFUSED':
            throw Error("Couldn't connect to the database")
            break;
        case 'PROTOCOL_CONNECTION_LOST':
            throw Error("Connection to the database was lost");
            break;
        case 'ETIMEDOUT':
           throw Error("The database took too long to respond");
            break;
        default:
            console.log("Unmanaged error: " + code)
            throw Error("Unmanaged error with code: " + code)
            break
    }
}
module.exports = handleMySQLErrors