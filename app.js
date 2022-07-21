const express = require('express');
require('dotenv').config();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { errors } = require('celebrate');
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

const userRouter = require('./routes/users');
const movieRouter = require('./routes/movies');
const regRouter = require('./routes/registration');
const authRouter = require('./routes/auth');
const handlerErrors = require('./middlewares/handlerErrors');
const auth = require('./middlewares/auth');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true,
}));
app.use(requestLogger);
app.use(cors());

app.use(regRouter);
app.use(authRouter);

app.use(auth);

app.use(userRouter);
app.use(movieRouter);

app.use('*', () => {
  throw new NotFoundError('Запрашиваемая страница не найдена');
});

app.use(errorLogger);
app.use(errors());

app.use(errors());
app.use(handlerErrors);

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});
