const express = require('express');
const app = express();
const { signUpUser, logInUser } = require("../controllers/auth/auth")
const router = express.Router();


router.post('/Signup', signUpUser);
router.post('/Signin', logInUser);

module.exports = router;