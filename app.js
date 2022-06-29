const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { celebrate, Joi, errors } = require('celebrate');
const cors = require('cors');
const { requestLogger, errorLogger } = require('./middlewares/logger');
const NotFoundError = require('./errors/not-found-err');

const {
  PORT = 3000,
} = process.env;
const app = express();

mongoose.connect('mongodb://localhost:27017/bitfilmsdb', {
  useNewUrlParser: true,
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));

const userRouter = require('./routes/users');
const movieRouter = require('./routes/movies');
const { createUser, login } = require('./controllers/users');
const auth = require('./middlewares/auth');

app.use(requestLogger);
app.use(cors());

app.post(
  '/signup',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
      name: Joi.string().required(),
    }),
  }),
  createUser,
);

app.post(
  '/signin',
  celebrate({
    body: Joi.object().keys({
      email: Joi.string().required().email(),
      password: Joi.string().required(),
    }),
  }),
  login,
);

app.use(auth);
// app.get('/users/me', getCurrentUser);
app.use('/users', userRouter);
app.use('/movies', movieRouter);

app.use('*', () => {
  throw new NotFoundError('Запрашиваемая страница не найдена');
});

app.use(errorLogger);
app.use(errors());

app.use((err, req, res, next) => {
  const {
    statusCode = 500, message,
  } = err;
  res.status(statusCode).send({
    message: statusCode === 500 ? 'На сервере произошла ошибка' : message,
  });
  next();
});

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
