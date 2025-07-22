//auth variables
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRE = process.env.JWT_EXPIRE;

//app variables
const FRONTEND_URL = process.env.FRONTEND_URL;
const SERVER_PORT = process.env.SERVER_PORT || 3000;

//database variables
const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING;

//nodemailer variables
const USER_EMAIL = process.env.USER_EMAIL;
const PASS_EMAIL = process.env.PASS_EMAIL;

//firebase variables
const FIREBASE_SERVICE_ACCOUNT_JSON = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;


module.exports = {
  JWT_SECRET,
  JWT_EXPIRE,
  FRONTEND_URL,
  SERVER_PORT,
  DB_CONNECTION_STRING,
  USER_EMAIL,
  PASS_EMAIL,
  FIREBASE_SERVICE_ACCOUNT_JSON
};