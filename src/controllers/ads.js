const { v4: uuidv4 } = require("uuid");
const jimp = require("jimp");

const Category = require("../models/category");
const User = require("../models/user");
const Ad = require("../models/ad");
const State = require("../models/state");
const Image = require("../models/image");

const addImage = async (buffer) => {
    const newName = `${uuidv4()}.jpg`;
    const tmpImg = await jimp.read(buffer);
    tmpImg.cover(500, 500).quality(80).write(`./public/media/${newName}`);
    return newName;
};

const isValidMimetype = (mimetype) => {
    const mimetypes = ["image/jpeg", "image/jpg", "image/png"];

    if (mimetypes.includes(mimetype)) return true;

    return false;
};

const pushImg = async (img, ad, isDefault = false) => {
    let url = await addImage(img.data);
    ad.images.push({ url, default: isDefault });

    return;
};

const idRegex = /[0-9]+/;

module.exports = {
    getStates: async (req, res) => {},

    addAction: async (req, res) => {
        let { title, price, priceneg, desc, cat, token } = req.body;

        if (!title || !cat) {
            res.json({ error: "Título ou categoria não informados" });
            return;
        }

        if (!cat.match(idRegex)) {
            res.json({ error: "Categoria inválida" });
            return;
        }

        const category = await Category.findByPk(cat);
        if (!category) {
            res.json({ error: "Categoria inválida" });
            return;
        }

        if (price) {
            price = price.replace(".", "").replace(",", ".").replace("R$ ", "");
            price = parseFloat(price);
        } else price = 0;

        const user = await User.findOne({ where: { token: token } });

        const newAd = new Ad({
            status: true,
            idUser: user._id,
            state: user.state,
            dateCreated: new Date(),
            title: title,
            category: cat,
            price: price,
            priceNegotiable: priceneg === "true" ? true : false,
            description: desc,
            views: 0,
        });

        if (!req.files || !req.files.img) {
            const info = await newAd.save();
            res.json({ id: info._id });
            return;
        }

        if (req.files.img.length == undefined) {
            if (isValidMimetype(req.files.img.mimetype))
                await pushImg(req.files.img, newAd, true);
        } else {
            for (let i in req.files.img)
                if (isValidMimetype(req.files.img[i].mimetype))
                    await pushImg(req.files.img[i], newAd, i === 0);
        }

        const info = await Ad.create(newAd);
        res.json({ id: info._id });
    },

    getList: async (req, res) => {
        let total = 0;
        let { sort = "asc", offset = 0, limit = 8, q, cat, state } = req.query;

        let filters = { status: "true" };

        if (q) filters.title = new RegExp(q, "i");
        if (cat) {
            const category = await Category.findOne({ where: { slug: cat } });
            if (category) filters.category = category._id.toString();
        }
        if (state) {
            const s = await State.findOne({
                name: state.toUpperCase(),
            }).exec();
            if (s) filters.state = s._id.toString();
        }

        

        let adsData;

        adsData = await Ad.findAll({
            where: filters,
            limit: parseInt(limit),
            offset: parseInt(offset),
            order: [["dateCreated", sort]],
        });
        total = adsData.length;

        let ads = [];
        for (let ad of adsData) {
            let image;
            let defaultImg = await Image.findOne({
                where: {
                    ad: ad._id,
                    default: true,
                },
            });

            if (defaultImg)
                image = `${process.env.BASE}/media/${defaultImg.url}`;
            else image = `${process.env.BASE}/media/default.jpg`;

            ads.push({
                id: ad._id,
                title: ad.title,
                price: ad.price,
                priceNegotiable: ad.priceNegotiable,
                image,
            });
        }

        res.json({ ads, total });
    },

    getItem: async (req, res) => {
        const { id, other = null } = req.query;

        if (!id) {
            res.json({ error: "Produto não informado" });
            return;
        }

        if (!id.match(idRegex)) {
            res.json({ error: "ID Inválido" });
            return;
        }

        const ad = await Ad.findByPk(id);

        if (!ad) {
            res.json({ error: "Produto não existe" });
            return;
        }

        ad.views++;
        await ad.save();

        let images = [];
        let queriedImages = await Image.findAll({
            where: {
                ad: ad._id,
            },
        });

        for (let img of queriedImages) {
            images.push(`${process.env.BASE}/media/${img.url}`);
        }

        let category = await Category.findByPk(ad.category);
        let userInfo = await User.findByPk(ad.idUser);
        let state = await State.findByPk(ad.state);

        let others = [];
        if (other) {
            const otherData = await Ad.findAll({
                where: {
                    status: "true",
                    idUser: ad.idUser,
                },
            });

            for (let data of otherData) {
                if (data._id.toString() !== ad._id.toString()) {
                    let image;
                    let defaultImg = await Image.findOne({
                        where: {
                            ad: data._id,
                            default: true,
                        },
                    });

                    if (defaultImg)
                        image = `${process.env.BASE}/media/${defaultImg.url}`;
                    else image = `${process.env.BASE}/media/default.jpg`;

                    others.push({
                        id: data._id,
                        title: data.title,
                        price: data.price,
                        priceNegotiable: data.priceNegotiable,
                        image,
                    });
                }
            }
        }

        res.json({
            id: ad._id,
            title: ad.title,
            price: ad.price,
            priceNegotiable: ad.priceNegotiable,
            description: ad.description,
            dateCreated: ad.dateCreated,
            views: ad.views,
            images,
            category,
            userInfo: {
                name: userInfo.name,
                email: userInfo.email,
            },
            stateName: state.name,
            others,
        });
    },

    getCategories: async (req, res) => {
        const unprocessed = await Category.findAll();
        let categories = [];

        for (let category of unprocessed) {
            categories.push({
                ...category.dataValues,
                img: `${process.env.BASE}/assets/images/${category.slug}.png`,
            });
        }

        res.json({ categories });
    },

    editAction: async (req, res) => {
        let { id } = req.params;
        let { title, status, price, priceneg, desc, cat, token } = req.body;

        if (!id.match(idRegex)) {
            res.json({ error: "ID Inválido" });
            return;
        }

        const ad = await Ad.findByPk(id);
        if (!ad) {
            res.json({ error: "Anúncio não encontrado" });
            return;
        }

        const user = await User.findOne({ where: { token: token } });
        if (user && user._id.toString() !== ad.idUser) {
            res.json({
                error: "Você não tem permissão para editar este anúncio",
            });
            return;
        }

        let updates = {};

        if (title) updates.title = title;
        if (status) updates.status = status;
        if (price) {
            price = price.replace(".", "").replace(",", ".").replace("R$ ", "");
            price = parseFloat(price);
            updates.price = price;
        }
        if (priceneg) updates.priceNegotiable = priceneg;
        if (desc) updates.description = desc;
        if (cat) {
            const category = await Category.findOne({ where: { slug: cat } });

            if (category) updates.category = category._id.toString();
        }

        if (req.files && req.files.img) {
            // const adI = await Ad.findByPk(id);

            if (req.files.img.length == undefined) {
                if (
                    ["image/jpeg", "image/jpg", "image/png"].includes(
                        req.files.img.mimetype
                    )
                ) {
                    let url = await addImage(req.files.img.data);

                    Image.create({
                        url,
                        ad: ad._id,
                        default: false,
                    });
                }
            } else {
                for (let i = 0; i < req.files.img.length; i++) {
                    if (
                        ["image/jpeg", "image/jpg", "image/png"].includes(
                            req.files.img[i].mimetype
                        )
                    ) {
                        let url = await addImage(req.files.img[i].data);

                        Image.create({
                            url,
                            ad: ad._id,
                            default: false,
                        });
                    }
                }
            }
        }

        await ad.update(updates);
        res.json({ success: true });
    },
};
