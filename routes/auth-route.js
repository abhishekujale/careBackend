const express = require('express');
const app = express();
const { signUpUser, logInUser } = require("../controllers/auth/auth")
const router = express.Router();


router.post('/register', signUpUser);
router.post('/login', logInUser);

module.exports = router;