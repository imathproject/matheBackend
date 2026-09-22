const User = require("../app/models/userModel");

const checkIfUserExist = (req, res, next) =>{
    User.findOne({
        where:{
            email: req.body.email
        }
    }).then(user => {
        if(user){
            return res.status(400).send({message: "Email already in use!"});
        }
        next();
    })
}

module.exports = {checkIfUserExist};