const bcrypt = require('bcryptjs');

const password = '123456';
const saltRounds = 12;

bcrypt.hash(password, saltRounds).then(hash => {
  console.log('Password:', password);
  console.log('Hash:', hash);
});





