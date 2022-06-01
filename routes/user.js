const express = require('express');
const passport = require('passport')
const router = express.Router();
const User = require('../models/user');
const catchAsync = require('../utils/catchAsync')
const registes = require('../controllers/users')

router.route('/register')
    .get(registes.renderRegister)
    .post(catchAsync(registes.register));

router.route('/login')
    .get(registes.renderLogin)
    // 로그인 인증이 authenticate애 되면
    .post(passport.authenticate('local', {failuerFlash: true, failureRedirect: '/login'}), registes.login)

router.get('/logout', registes.logoutUser)

module.exports = router;