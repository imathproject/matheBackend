    const auth = require("../controllers/authController");
    var router = require("express").Router();
    const verifyUser = require("../../middleware/verifySignUp");

    router.post("/login", auth.login);
    router.post("/refreshToken", auth.refreshToken);
    router.get("/logout", auth.logout);
    router.post("/singUp", verifyUser.checkIfUserExist, auth.signUp);
    router.post("/requestNewPassword", auth.requestNewPassword);
    router.post("/recoverPassword", auth.recoverPassword);
    router.get("/confirmEmail/:checkcode", auth.confirmEmail);
   // router.post("/token", auth.refreshToken);
   
    module.exports = router;