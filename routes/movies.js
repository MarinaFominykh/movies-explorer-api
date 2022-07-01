const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const validator = require('validator');

const {
  createMovie,
  deleteMovie,
  getMovie,
} = require('../controllers/movies');

router.post('/', celebrate({
  body: Joi.object().keys({
    country: Joi.string().required(),
    director: Joi.string().required(),
    duration: Joi.number().required(),
    year: Joi.string().required(),
    description: Joi.string().required(),
    image: Joi.string().custom((value) => {
      if (!validator.isURL(value, { require_protocol: true })) {
        throw new Error('Неправильный формат ссылки');
      }
      return value;
    }),
    trailerLink: Joi.string().custom((value) => {
      if (!validator.isURL(value, { require_protocol: true })) {
        throw new Error('Неправильный формат ссылки');
      }
      return value;
    }),
    thumbnail: Joi.string().custom((value) => {
      if (!validator.isURL(value, { require_protocol: true })) {
        throw new Error('Неправильный формат ссылки');
      }
      return value;
    }),
    movieId: Joi.number().required(),
    nameRU: Joi.string().required(),
    nameEN: Joi.string().required(),
  }),
}), createMovie);

router.delete('/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.string().length(24).hex().required(),
  }),
}), deleteMovie);

router.get('/', getMovie);

module.exports = router;
