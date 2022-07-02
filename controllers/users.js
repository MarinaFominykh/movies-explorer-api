const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { NODE_ENV, JWT_SECRET_KEY } = process.env;
const User = require('../models/user');
const NotFoundError = require('../errors/not-found-err');
const InValidDataError = require('../errors/in-valid-data-err');
const EmailDuplicateError = require('../errors/email-duplicate-err');

const createUser = (req, res, next) => {
  const {
    email,
    password,
    name,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => {
      User.create({ email, password: hash, name })
        .then(() => {
          res.send({
            email,
            name,
          });
        })
        .catch((error) => {
          if (error.code === 11000) {
            const duplicateError = new Error('Пользователь с таким e-mail уже существует');
            duplicateError.statusCode = 409;
            next(duplicateError);
          } else if (error._message === 'user validation failed') {
            const validateError = new Error('Переданы некорректные данные');
            validateError.statusCode = 400;
            return next(validateError);
          }
          return next(error);
        });
    })
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;
  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, NODE_ENV === 'production' ? JWT_SECRET_KEY : 'dev-secret', { expiresIn: '7d' });
      res.send({ token });
    })
    .catch(next);
};

const getCurrentUser = (req, res, next) => {
  User.findOne(req.user)
    .then((user) => {
      if (!user) {
        throw new NotFoundError('Такой пользователь не найден');
      }
      res.send({ data: user });
    })
    .catch(next);
};

const updateUser = (req, res, next) => {
  const { email, name } = req.body;
  if (!email || !name) {
    throw new InValidDataError('Переданы некорректные данные при обновлении данных пользователя');
  }
  User.findByIdAndUpdate(req.user, { email, name }, { new: true })
    .then((data) => res.send({ data }))
    .catch((error) => {
      if (error.code === 11000) {
        next(new EmailDuplicateError('Пользователь с таким e-mail уже существует'));
      } else if (error._message === 'user validation failed') {
        const validateError = new InValidDataError('Переданы некорректные данные при обновлении данных пользователя');
        return next(validateError);
      }
      return next(error);
    })

  // {
  //   if (error.name === 'ValidationError') {
  //     next(new InValidDataError('Переданы некорректные данные при создании карточки'));
  //   } else { next(error); }
  // }

    .catch(next);
};

module.exports = {
  createUser,
  login,
  getCurrentUser,
  updateUser,
};
