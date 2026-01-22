const db = require("./Connections.js");
const handleMySQLErrors = require("../utils/handleMySQlExceptions.js");

class ProjectDB {
    constructor() {}

    async readProjectsByUserId(userId) {
        let res;
        try {
            res = await db.execute('SELECT p.id, p.name, p.description, p.created_at, (SELECT COUNT(*) FROM models WHERE project_id = p.id) as models FROM projects p WHERE p.user_id = ?', [userId]);
        } catch (error) {
            handleMySQLErrors(error.code);
        }
        return res[0];
    }
}

const projectDB = new ProjectDB();
module.exports = projectDB;
