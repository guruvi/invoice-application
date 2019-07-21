const postSchema = {
    type: "object",
    required: ["mobileNo", "customerName", "address", "city", "gstIn"],
    properties: {
        mobileNo: { type: "integer", minLength: 10 },
        customerName: { type: "string", minLength: 1 },
        address: { type: "string", minLength: 1 },
        city: {type: "string", minLength: 1},
        gstin: { type: "string", minLength: 1 }
    }
};

module.export = {
    postSchema
}