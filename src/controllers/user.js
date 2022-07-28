const { validationResult, matchedData } = require("express-validator");
const State = require("../models/state");
const User = require("../models/user");
const Category = require("../models/category");
const Ad = require("../models/ad");
const Image = require("../models/image");

const { default: bcrypt } = require("bcrypt");

const idRegex = /[0-9]+/;

module.exports = {
    getStates: async (req, res) => {
        let states = await State.findAll();
        res.json({ states });
    },

    info: async (req, res) => {
        let token = req.query.token;

        const user = await User.findOne({ where: { token: token } });
        const state = await State.findByPk(user.state);
        const ads = await Ad.findAll({
            where: { idUser: user._id.toString() },
        });

        var adList = [];

        for (let ad of ads) {
            const images = await Image.findAll({
                where: { ad: ad._id.toString() },
            });
            const category = await Category.findByPk(ad.category);
            adList.push({
                _doc: {
                    ...ad.dataValues,
                    images: images,
                    category: category.slug,
                },
            });
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
            const emailCheck = await User.findOne({
                where: { email: data.email },
            });
            if (emailCheck) {
                res.json({ error: { email: { msg: "Email já cadastrado" } } });
                return;
            }
            updates.email = data.email;
        }

        if (data.state) {
            if (data.state.match(idRegex)) {
                res.json({ error: { state: { msg: "Estado inválido" } } });
                return;
            }

            const stateExists = await State.findByPk(data.state);
            if (!stateExists) {
                res.json({ error: { state: { msg: "Estado não existe" } } });
                return;
            }
            updates.state = data.state;
        }

        if (data.password) {
            updates.passwordHash = await bcrypt.hash(data.password, 10);
        }

        const user = await User.findOne({ where: { token: data.token } });
        await user.update(updates);

        res.json({});
    },
};
