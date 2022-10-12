const fs = require('fs');

const data = fs.readFileSync('./database.json'); //databse를 읽어옴 

const conf = JSON.parse(data); //object를 파싱해준다, database를 집적 올리면 보안이 위험하므로 사용
const mysql = require('mysql'); //mysql 라이브러리 사용

const connection = mysql.createConnection( {    //연결을 만들어줌
    "host" : conf.host,
    "user" : conf.user, 
    "password" : conf.password,
    "port" : conf.port,
    "database" : conf.database
})

connection.connect();

module.exports = connection