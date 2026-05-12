function softDeleteMiddleware() {

    this.where({
        $or: [
            { isDeleted: false },
            { isDeleted: { $exists: false } }
        ]
    });



}

module.exports = softDeleteMiddleware;