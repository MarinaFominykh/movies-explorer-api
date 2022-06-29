const Movie = require('../models/movie');
const NotFoundError = require('../errors/not-found-err');
const ForbiddenError = require('../errors/forbidden-err');
const InValidDataError = require('../errors/in-valid-data-err');

const createMovie = (req, res, next) => {
  const {
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
  } = req.body;
  const owner = req.user;
  Movie.create({
    country,
    director,
    duration,
    year,
    description,
    image,
    trailerLink,
    nameRU,
    nameEN,
    thumbnail,
    movieId,
    owner,
  })
    .then((movie) => res.status(200).send(movie))
    .catch((error) => {
      if (error.name === 'ValidationError') {
        const inValidDataError = new InValidDataError('Переданы некорректные данные');
        return next(inValidDataError);
      }
      // Работает с return?
      return next(error);
    });
};

const deleteMovie = (req, res, next) => {
  const owner = req.user._id;
  Movie.findById(req.params.id)
    .then((movie) => {
      if (!movie) {
        throw new NotFoundError('Запрашиваемый фильм не найден');
      }
      return movie;
    })
    .then((movie) => {
      if (String(movie.owner) === owner) {
        return movie.remove();
      }
      throw new ForbiddenError('Вы не можете удалять чужие фильмы');
    })
    .then(() => res.status(200).send({
      message: 'Фильм успешно удален!',
    }))
    .catch((error) => {
      if (error.kind === 'ObjectId') {
        const inValidDataError = new InValidDataError('Переданы некорректные данные');
        return next(inValidDataError);
      }
      return next(error);
    });
};

const getMovie = (req, res, next) => {
  Movie.find({
    owner: req.user,
  })
    .then((movie) => {
      if (movie.length === 0) {
        throw new NotFoundError('У вас отсутствуют сохраненные фильмы');
      }
      res.status(200).send(movie);
    })
    .catch(next);
};

module.exports = {
  createMovie,
  deleteMovie,
  getMovie,
};
