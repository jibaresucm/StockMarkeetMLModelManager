const db = require("../Database/Connections.js");
const handleMySQLErrors = require("../utils/handleMySQlExceptions.js");

class ModelDB {
    constructor() {}

    async readModelsByUserId(userId) {
        let res;
        try {
            // This query joins through projects to ensure we only get models belonging to the user
            res = await db.execute(
                'SELECT m.id, m.name, m.description, m.version, m.project_id, m.created_at FROM models m JOIN projects p ON m.project_id = p.id WHERE p.user_id = ?', 
                [userId]
            );
        } catch (error) {
            handleMySQLErrors(error.code);
        }
        return res[0];
    }
}

const modelDB = new ModelDB();
module.exports = modelDB;
