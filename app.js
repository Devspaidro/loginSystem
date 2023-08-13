const express = require('express');
const session = require('express-session');
const mongoose = require('mongoose');
const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'mysecretkey',
  resave: false,
  saveUninitialized: false
}));

mongoose.connect('mongodb://localhost:27017/mydatabase', { useNewUrlParser: true, useUnifiedTopology: true });

const User = mongoose.model('User', {
  username: String,
  password: String
});

app.get('/profile', (req, res) => {
  if (req.session.username) {
    res.send(`مرحبًا ${req.session.username} في صفحتك الشخصية`);
  } else {
    res.redirect('/login');
  }
});

app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

app.post('/login', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ username: username, password: password })
    .then(user => {
      if (user) {
        req.session.username = username;
        res.redirect('/profile');
      } else {
        res.send('اسم المستخدم أو كلمة المرور غير صحيحة');
      }
    })
    .catch(err => {
      res.send('حدث خطأ أثناء تسجيل الدخول');
    });
});
app.get('/signup', (req, res) => {
    res.sendFile(__dirname + '/signup.html');
  });
app.post('/signup', (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  User.findOne({ username: username })
    .then(user => {
      if (user) {
        res.send('اسم المستخدم موجود بالفعل');
      } else {
        const newUser = new User({ username: username, password: password });
        newUser.save()
          .then(() => {
            req.session.username = username;
            res.redirect('/profile');
          })
          .catch(err => {
            res.send('حدث خطأ أثناء إنشاء الحساب');
          });
      }
    })
    .catch(err => {
      res.send('حدث خطأ أثناء التحقق من اسم المستخدم');
    });
});

app.listen(port, () => {
  console.log(`الخادم يعمل على المنفذ ${port}`);
});