const { v4: uuidv4 } = require("uuid");
const jimp = require("jimp");

const Category = require("../models/category");
const User = require("../models/user");
const Ad = require("../models/ad");

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

const pushImg = async (img, ad) => {
    let url = await addImage(img.data);
    ad.images.push({ url, default: true });

    return;
};

module.exports = {
    getStates: async (req, res) => {},

    addAction: async (req, res) => {
        let { title, price, priceneg, desc, cat, token } = req.body;

        if (!title || !cat) {
            res.json({ error: "Título ou categoria não informados" });
            return;
        }

        if (price) {
            price = price.replace(".", "").replace(",", ".").replace("R$ ", "");
            price = parseFloat(price);
        } else price = 0;

        const user = await User.findOne({ token }).exec();

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
                await pushImg(req.files.img, newAd);
        } else {
            for (let img of req.files.img)
                if (isValidMimetype(img.mimetype)) await pushImg(img, newAd);
        }

        const info = await newAd.save();
        res.json({ id: info._id });
    },

    getList: async (req, res) => {},

    getItem: async (req, res) => {},

    getCategories: async (req, res) => {
        const unprocessed = await Category.find();

        let categories = [];

        for (let category of unprocessed) {
            categories.push({
                ...category.doc,
                img: `${process.env.BASE}/assets/images/${category.slug}.png`,
            });
        }

        res.json({ categories });
    },

    editAction: async (req, res) => {},
};
