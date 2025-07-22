const admin = require('firebase-admin');
const { FIREBASE_SERVICE_ACCOUNT_JSON } = require('./env-variable')

let serviceAccount;
if (FIREBASE_SERVICE_ACCOUNT_JSON) {
  serviceAccount = JSON.parse(FIREBASE_SERVICE_ACCOUNT_JSON);
} else {
  serviceAccount = require('./serviceAccountKey.json');
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: "api-repairs.appspot.com"
});

module.exports = admin;


