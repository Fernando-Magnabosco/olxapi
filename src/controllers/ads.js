const Category = require("../models/category");

module.exports = {
    getStates: async (req, res) => {},

    addAction: async (req, res) => {},

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
