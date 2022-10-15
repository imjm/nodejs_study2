var express = require('express');
var router = express.Router();

var fs = require('fs');
var mysql = require('mysql'); //mysql 라이브러리 사용

var data = fs.readFileSync('./database.json'); //databse를 읽어옴
var conf = JSON.parse(data); //object를 파싱해준다, database를 집적 올리면 보안이 위험하므로 사용

var connection = mysql.createConnection( {    //연결을 만들어줌
    "host" : conf.host,
    "user" : conf.user, 
    "password" : conf.password,
    "port" : conf.port,
    "database" : conf.database
})

/* GET home page. */

router.get('/list', function(req, res, next) {
    res.redirect('/board/1');
  });

router.get('/', function(req, res, next) {

  var query = connection.query('SELECT idx, title, writer, hit, DATE_FORMAT(moddate, "%Y/%m/%d %T") AS moddate FROM topic', function(err, rows){
    if(err) console.log(err);
    console.log(rows);
    res.render('list', {title:'Board List', rows: rows});
  });
});

router.get('/read/:idx', function(req, res, next){
  var idx = req.params.idx;
  console.log("idx: " + idx);

  connection.beginTransaction(function(err){
    if(err) console.log(err);
    connection.query('UPDATE topic SET hit=hit + 1 WHERE idx=?', [idx], function(err){
      if(err) {
        console.log(err);
        connection.rollback(function() {
          console.error('rollback error1');
        })
      }
      connection.query('SELECT idx, title, content, writer, hit, DATE_FORMAT(moddate, "%Y/%m/%d %T")' + 
      'AS moddate, DATE_FORMAT(regdate, "%Y/%m/%d %T") AS regdate FROM topic WHERE idx=?', [idx], function(err, rows){
        if(err) {
          console.log(err);
          connection.rollback(function(){
            console.error('rollback2');
          })
        }
        else {
          connection.commit(function (err) {
            if(err) console.log(err);
            console.log(rows);
            res.render("read", {title:rows[0].title, rows : rows})
          })
        }
      })
    })
  })
})

router.get('/write', function(req, res, next) {
  res.render('write', {title: '글 쓰기 페이지'});
})

router.post('/write', function(req, res, next) {
  var body = req.body;
  var writer = body.writer;
  var title = body.title;
  var content = body.content;
  var password = body.password;

  connection.beginTransaction(function(err){
    if(err) console.log(err);
    connection.query('INSERT INTO topic(title, writer, content, password) VALUES(?, ?, ?, ?)', 
      [title, writer, content, password], function(err){
        if(err) {
          console.log(err);
          connection.rollback(function(){
            console.log('rollback error1');
          })
        }
        connection.query('SELECT LAST_INSERT_ID() AS idx', function(err, rows){
          if(err){
            console.log(err);
            connection.rollback(function(){
              console.log('rollback error2');
            })
          } else {
            connection.commit(function (err){
              if(err) console.log(err);
              console.log(rows);
              var idx = rows[0].idx;
              res.redirect('/board/read/'+idx);
            })
          }
        })
      })
  })
})

module.exports = router;
