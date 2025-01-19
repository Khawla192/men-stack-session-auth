const express = require("express")
const bcrypt = require("bcrypt")
const User = require("../models/user.js")

const router = express.Router()

router.get("/sign-up", (req, res) => {
    res.render("auth/sign-up.ejs")
})

router.post("/sign-up", async (req, res) => {
    const password = req.body.password
    const confirmPassword = req.body.confirmPassword
    const username = req.body.username

    // Check the password for validity
    if (password != confirmPassword) {
        return res.send("Passwords do not match!")
    } 
    // check the user in the DB
    const userInDatabase = await User.findOne({ username })

    if (userInDatabase) {
        return res.send("Username or password os invalid.")
    }

    // Create the new registration
    // 1. Encrybt the password 
    const hashedPassword = bcrypt.hashSync(password, 10)
    
    // 2. Replace the raw password with the encrybted password
    req.body.password = hashedPassword

    // 3. Save the user in the DB
    const newUser = await User.create(req.body)
    req.session.user = {
        username: user.username,
      };
      
      req.session.save(() => {
        res.redirect("/");
      });
      
    // res.send(newUser.username)
})

router.get("/sign-in", (req, res) => {
    res.render("auth/sign-in.ejs")
})

router.post("/sign-in", async (req, res) => {
    const username = req.body.username
    const password = req.body.password

    const userInDatabase = await User.findOne({ username })

    if (!userInDatabase) {
        return res.send("Login failed. Please try again.")
    }

    const validPassword = bcrypt.compareSync(
        password,
        userInDatabase.password
    )
    if (!validPassword) {
    return res.send("Login failed. Please try again.")
    }

    req.session.user = {
        username: userInDatabase.username,
        _id: userInDatabase._id,
    }

    req.session.save(() => {
        res.redirect("/")
    })
})

router.get("/sign-out", (req, res) => {
    req.session.destroy(() => {
        res.redirect("/")
    })     
})

module.exports = router
