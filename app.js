const express = require("express");
const mysql = require("mysql");
const ejs = require('ejs');
const app = express();
const port = 9000;
const path = require('path');
const session = require('express-session');
const crypto = require('crypto');
const FileStore = require('session-file-store')(session);
const cookieParser = require('cookie-parser');
const { fstat } = require("fs");

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(express.static("assets"));
app.use(express.json());

const con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'Qwer1234!',
    database: 'nodejs_db',
});

app.use(session({
    secret: 'mykey',
    resave: false,
    saveUninitialized: true,
    store: new FileStore()
}));


//회원가입
app.get('/register', (req, res) => {
    console.log('회원가입 페이지');
    res.render('register');
});

app.post('/register', (req, res) => {
    console.log('회원가입 하는 중')
    const body = req.body;
    const name = body.name;
    const id = body.id;
    const pw = body.pw;
    

    con.query('select * from users where id=?', [id], (err, data) => {
        if (data.length == 0) {
            console.log('회원가입 성공');
            con.query('insert into users(name, id, pw) values(?,?,?)', [name, id, pw]);
            res.send('<script>alert("회원가입 성공"); location.href="/" </script> ');
        }
        else {
            console.log('회원가입 실패');
            res.send('<script>alert("회원가입 실패!!() 동일한 정보가 존재합니다.)"); location.href="/register" </script>');
        }
    });
});

app.get('/login', (req, res) => {
    console.log('로그인 작동');
    res.render('login');
})

app.post('/login', (req, res) => {
    const body = req.body;
    const id = body.id;
    const pw = body.pw;

    con.query('select * from users where id =?', [id], (err, data) => {
        console.log(data[0]);
        console.log(id);
        console.log(data[0].id);
        console.log(data[0].pw);
        console.log(id == data[0].id);
        console.log(pw == data[0].pw);

        if (id == data[0].id && pw == data[0].pw) {
            console.log('로그인 성공');
            req.session.is_logined = true;
            req.session.name = data.name;
            req.session.id = data.id;
            req.session.pw = data.pw;
            req.session.save(function () {
                res.render('insert', {
                    name: data[0].name,
                    id: data[0].id,
                    pw: data[0].pw,
                    is_logined: true
                });
            });
            
        } else {
            console.log('로그인 실패');
            res.render('login');
        }
    });
});

app.get('/logout', (req, res) => {
    console.log('로그아웃 성공');
    req.session.destroy(function (err) {
        res.redirect('/');
    });
});


app.get('/insert', (req, res) => {
    const sql = 'select * from book_re';
    con.query(sql, function (err, result, fields){
        if(err) throw err;
        res.render('list', {book_re : result});
    });
});

app.get('/list', (req,res) => {
    const sql = 'select * from book_re';
    con.query(sql, function (err, result, fields){
        if(err) throw err;
        res.render('list', {book_re : result});
    });
})

app.get('/create', (req, res) => {
    res.sendFile(path.join(__dirname, '/insert'))
})

app.post('/insert', (req, res) => {
    const sql = 'insert into book_re set ?';
    con.query(sql, req.body, function (err, result, fields) {
        if(err) throw err;
        console.log(result);
        res.send('도서 신청 등록이 완료되었습니다.');
    })
})

app.get('/delete/:id', (req, res) => {
    const sql = "delete from book_re where id = ?";
    con.query(sql, [req.params.id], function (err, result, fields) {
        if(err) throw err;
        console.log(result);
        res.redirect('/insert');
    })
})

app.get('/edit/:id', (req, res) => {
    const sql = 'select * from book_re where id = ?';
    con.query(sql, [req.params.id], function (err, result, fields) {
        if (err) throw err;
        res.render('edit', {book_re : result});
    })
})

app.post('/update/:id', (req, res) => {
    const sql = 'update book_re set ? where id = ' + req.params.id;
    con.query(sql, req.body, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        res.redirect('/insert');
    })
})


app.listen(port, () => {
    console.log(`${port}번 포트에서 서버 대기중입니다.`);
});


app.get("/bookList", (req, res) => {
    const sql = "select * from book";
    con.query(sql, function (err, result, fields) {
      if (err) throw err;
      res.render("bookList", { bookList: result });
    });
  });
  
  app.post("/book_insert", (req, res) => {
    const sql = "insert into book set ?";
    con.query(sql, req.body, function (err, result, fields) {
      if (err) throw err;
      console.log(result);
      res.redirect("/book_insert");
    });
  });
  
  
  app.get('/bookDelete/:id', (req, res) => {
    const sql = "delete from book where id = ?";
    con.query(sql, [req.params.id], function (err, result, fields) {
        if(err) throw err;
        console.log(result);
        res.redirect('/bookList');
    })
})
  
  

  app.get('/bookEdit/:id', (req, res) => {
    const sql = 'select * from book where id = ?';
    con.query(sql, [req.params.id], function (err, result, fields) {
        if (err) throw err;
        res.render('bookEdit', {book_re : result});
    })
})

app.post('/bookUpdate/:id', (req, res) => {
    const sql = 'update book set ? where id = ' + req.params.id;
    con.query(sql, req.body, function (err, result, fields) {
        if (err) throw err;
        console.log(result);
        res.redirect('/bookList');
    })
})