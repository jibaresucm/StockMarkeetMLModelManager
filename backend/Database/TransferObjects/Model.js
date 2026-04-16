class Model {
    constructor(id, name, description, user_id, stock, period, model_type, createdAt, features, hyperparameters, optimize_hyperparameters) {
        this.id = id
        this.name = name
        this.description = description
        this.user_id = user_id
        this.stock = stock
        this.period = period
        this.model_type = model_type
        this.createdAt = createdAt
        this.features = typeof features === 'string' ? JSON.parse(features) : (features || null)
        this.hyperparameters = typeof hyperparameters === 'string' ? JSON.parse(hyperparameters) : (hyperparameters || null)
        this.optimize_hyperparameters = optimize_hyperparameters ? true : false
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            description: this.description,
            user_id: this.user_id,
            stock: this.stock,
            period: this.period,
            model_type: this.model_type,
            createdAt: this.createdAt,
            features: this.features,
            hyperparameters: this.hyperparameters,
            optimize_hyperparameters: this.optimize_hyperparameters
        }
    }
}

module.exports = Model
