
const mongoose = require("mongoose");
const passport = require("passport");
const express = require("express");
const router = express.Router();
const auth = require("../auth");
const User = mongoose.model("User")

//POST new user route (optional, everyone has access)
router.post("/", auth.optional, function(err, req, res, next){
  const { body: { user }} = req;

  if(!user.email){
    return res.status(422).json({
      errors: {
        email: "is required",
      },
    });
  }

  if(!user.password){
    return res.status(422).json({
      errors: {
        password: "is required"
      }
    });
  }

  const finalUser = new User(user);
  finalUser.setPassword(user.password);

  return finalUser.save()
    .then(() => res.json({user: finalUser.toAuthJSON()}));
  
});

//POST login route (optional, everyone has access)
router.post("/login", auth.optional, function(err, req, res, next){
  const { body: { user }} = req;

  if(!user.email){
    return res.status(422).json({
      errors: {
        email: "is required",
      },
    });
  }
  if(!user.password){
    return res.status(422).json({
      errors: {
        password: "is required"
      },
    });
  }

  return passport.authenticate("local", {session: false},(err, passportUser, info) =>{
    if(err){
      return next(err);
    }
    if(passportUser){
      const user = passportUser;
      user.token = passportUser.generateJWT();

      return res.json({ user: user.toAuthJSON()});
    }
    return res.status(400).send(info);
  })(req, res, next);
});

//GET current route (required, only authenticated users have access)
router.get("/current", auth.required, function(err, req, res, next){
  const { payload: {id}} = req;

  return User.findById(id)
    .then((user) => {
      if(!user){
        return res.sendStatus(400);
      }

      return res.json({
        user: user.toAuthJSON()
      });
    });
});

module.exports = router;