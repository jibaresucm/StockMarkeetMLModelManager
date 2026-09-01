
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
        case 'ER_NO_REFERENCED_ROW_2':
            throw Error("Tried to insert a row with a foreign key that doesn't exist")
            break
        case 'ER_DUP_ENTRY':
            throw Error("Already exists an entry with that primary key in the db")
        default:
            throw Error("Unmanaged error with code: " + code)
            break
    }
}
module.exports = handleMySQLErrors