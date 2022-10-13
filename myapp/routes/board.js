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

  var query = connection.query('SELECT idx, title, writer, hit, DATE_FORMAT(moddate, "%Y/%m%d %T") AS moddate FROM topic', function(err, rows){
    if(err) console.log(err);
    console.log('rows :' + rows);
    res.render('list', {title:'Board List', rows: rows});
  });
});

module.exports = router;
