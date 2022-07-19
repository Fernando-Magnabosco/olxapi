const { validationResult, matchedData } = require("express-validator");
const State = require("../models/state");
const User = require("../models/user");
const Category = require("../models/category");
const Ad = require("../models/ad");
const { default: mongoose } = require("mongoose");
const { default: bcrypt } = require("bcrypt");

module.exports = {
    getStates: async (req, res) => {
        let states = await State.find();
        res.json({ states });
    },

    info: async (req, res) => {
        let token = req.query.token;

        const user = await User.findOne({ token });
        const state = await State.findById(user.state);
        const ads = await Ad.find({ idUser: user._id.toString() });

        var adList = [];

        for (let ad of ads) {
            const category = await Category.findById(ad.category);
            adList.push({ ...ad, category: category.slug });
        }

        res.json({
            name: user.name,
            email: user.email,
            state: state.name,
            ads: adList,
        });
    },

    editAction: async (req, res) => {
        const errors = validationResult(req);
        console.log(errors);
        if (!errors.isEmpty()) {
            res.json({ error: errors.mapped() });
            return;
        }
        const data = matchedData(req);

        let updates = {};

        if (data.name) updates.name = data.name;

        if (data.email) {
            const emailCheck = await User.findOne({ email: data.email });
            if (emailCheck) {
                res.json({ error: { email: { msg: "Email já cadastrado" } } });
                return;
            }
            updates.email = data.email;
        }

        if (data.state) {
            if (!mongoose.Types.ObjectId.isValid(data.state)) {
                res.json({ error: { state: { msg: "Estado inválido" } } });
                return;
            }

            const stateExists = await State.findById(data.state);
            if (!stateExists) {
                res.json({ error: { state: { msg: "Estado não existe" } } });
                return;
            }
            updates.state = data.state;
        }

        if (data.password) {
            updates.passwordHash = await bcrypt.hash(data.password, 10);
        }

        await User.findOneAndUpdate({ token: data.token }, { $set: updates });

        res.json({});
    },
};
