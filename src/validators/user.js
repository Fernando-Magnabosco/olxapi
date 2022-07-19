const { checkSchema } = require("express-validator");

module.exports = {
    editAction: checkSchema({
        token: {
            notEmpty: true,
        },
        name: {
            optional: true,
            trim: true,
            isLength: {
                options: { min: 2, max: 30 },
            },
            errorMessage: "Nome deve conter entre 2 e 30 caracteres",
        },
        email: {
            optional: true,
            isEmail: true,
            normalizeEmail: true,
            errorMessage: "Email inválido",
        },
        password: {
            optional: true,
            isLength: {
                options: { min: 8 },
            },
            errorMessage: "A senha deve conter pelo menos 8 caracteres",
        },
        state: {
            optional: true,
            notEmpty: true,
            errorMessage: "State is required",
        },
    }),
};
