const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  createUser,
} = require('../controllers/users');

router.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  createUser,
);

module.exports = router;
