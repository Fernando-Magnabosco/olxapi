const User = require("../models/user.js");

module.exports = {
    private: async (req, res, next) => {
        if (!req.query.token && !req.body.token) {
            res.json({ notallowed: true });
            return;
        }

        let token = "";
        if (req.query.token) {
            token = req.query.token;
        } else if (req.body.token) {
            token = req.body.token;
        }

        if (token == "") {
            res.json({ notallowed: true });
            return;
        }

        const user = await User.findOne({ where: { token: token } });

        if (!user) {
            res.json({ notallowed: true });
            return;
        }

        next();
    },
};
