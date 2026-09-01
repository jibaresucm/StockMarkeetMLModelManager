class Project {
    constructor(id, name, description, user_id, createdAt) {
        this.id = id
        this.name = name
        this.description = description
        this.user_id = user_id
        this.createdAt = createdAt
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            user_id: this.user_id,
            createdAt: this.createdAt
        }
    }
}

module.exports = Project
