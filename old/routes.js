var express = require('express');
var url = require('url');
var http = require('http');
var https = require('https');
var fs = require('fs');
var app = express();
var router = express.Router();
//var options = {
//    host: '127.0.0.1',
//    key:  fs.readFileSync('ssl/server.key'),
//    cert: fs.readFileSync('ssl/server.crt')
//    };
http.createServer(app).listen(80);
https.creatServer(app).listen(443);

console.log('It\'s running!');

app.set('views', path.join(__dirname, 'views'));
app.use(router);
app.use(express.static(path.join(__dirname, 'public')));

//app.listen(80);
app.get('/', function (req, res) {
  console.log('req is: ' + req.headers);
  var headers = JSON.stringify(req.headers);
  var query = JSON.stringify(req.query);
  var body = [];
  req.on('data', function(chunk) {
    body.push(chunk);
  }).on('end', function() {
    body = Buffer.concat(body).toString();
  });

  console.log(query);
  var sendme = headers + ',' + query + ',' + body;

  res.json(sendme);
});
app.get('/rd', function (req, res) {
  for(query in req.query){
    if (query === 'google') {
      res.redirect('http://google.com');
    }
  }
});
app.get('/curl', function (req, res) {
  if (req.get('Accept') === 'application/vnd.byu.cs462.v1+json') {
    res.send('{"version": "v1" }');
  }
  else if (req.get('Accept') === 'application/vnd.byu.cs462.v2+json') {
    res.send('{"version": "v2" }');
  }
  console.log(req.get('Accept'));
  res.send('Wrong');
});

app.get('/user/:username', function (req, res) {
  res.send("Get User: " + req.param("username"));
});
