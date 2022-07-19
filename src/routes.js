const express = require("express");
const router = express.Router();

const Auth = require("./middlewares/auth.js");

const AuthValidator = require("./validators/auth.js");
const UserValidator = require("./validators/user.js");

const AuthController = require("./controllers/auth.js");
const UserController = require("./controllers/user.js");
const AdsController = require("./controllers/ads.js");

router.get("/ping", (req, res) => {
    res.json({ pong: true });
});

router.get("/states", UserController.getStates);

router.post("/user/signin", AuthValidator.signin, AuthController.signin);
router.post("/user/signup", AuthValidator.signup, AuthController.signup);

router.get("/user/me", Auth.private, UserController.info);

router.put(
    "/user/me",
    UserValidator.editAction,
    Auth.private,
    UserController.editAction
);

router.get("/categories", AdsController.getCategories);

router.post("/ad/add", Auth.private, AdsController.addAction);
router.get("/ad/list", AdsController.getList);
router.get("/ad/item", AdsController.getItem);
router.post("/ad/:id", Auth.private, AdsController.editAction);

module.exports = router;
