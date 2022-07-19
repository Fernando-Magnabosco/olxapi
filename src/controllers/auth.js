const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { validationResult, matchedData } = require("express-validator");
const User = require("../models/user");
const State = require("../models/state");

module.exports = {
    signin: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.json({ error: errors.mapped() });
            return;
        }
        const data = matchedData(req);

        const user = await User.findOne({ email: data.email });

        if (!user) {
            res.json({ error: "Email e/ou senha inválidos" });
            return;
        }

        const isValid = await bcrypt.compare(data.password, user.passwordHash);

        if (!isValid) {
            res.json({ error: "Email e/ou senha inválidos" });
            return;
        }

        const payLoad = (Date.now() + Math.random()).toString();
        const token = await bcrypt.hash(payLoad, 10);

        user.token = token;
        await user.save();

        res.json({
            token,
            email: data.email,
        });
    },

    signup: async (req, res) => {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            res.json({ error: errors.mapped() });
            return;
        }
        const data = matchedData(req);

        const user = await User.findOne({
            email: data.email,
        });

        if (user) {
            res.json({ error: { email: { msg: "Email já cadastrado" } } });
            return;
        }

        if (mongoose.Types.ObjectId.isValid(data.state)) {
            const stateItem = await State.findById(data.state);

            if (!stateItem) {
                res.json({ error: { state: { msg: "Estado não existe" } } });
                return;
            }
        } else {
            res.json({ error: { state: { msg: "Estádo inválido" } } });
            return;
        }

        const passwordHash = await bcrypt.hash(data.password, 10);

        const payLoad = (Date.now() + Math.random()).toString();
        const token = await bcrypt.hash(payLoad, 10);

        const newUser = new User({
            name: data.name,
            email: data.email,
            passwordHash,
            token,
            state: data.state,
        });

        await newUser.save();

        res.json({ token });
    },
};
