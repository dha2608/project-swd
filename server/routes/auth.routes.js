const express = require('express');
const { register, login, getMe } = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const {
    validateRegisterRules,
    validateLoginRules,
    validate
} = require('../middleware/validation.middleware');

const router = express.Router();

router.post('/register', validateRegisterRules, validate, register);
router.post('/login', validateLoginRules, validate, login);

router.get('/me', protect, getMe);

module.exports = router;