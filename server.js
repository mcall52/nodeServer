var express = require('express');
var url = require('url');
var http = require('http');
var https = require('https');
var uuidV4 = require('uuid/v4');
var fs = require('fs');
var path = require('path');
var cluster = require('cluster');

var app = express();
var router = express.Router();
var bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

var client_id = 'C1QZRWYXB0JWDJVGNT3ETDLVOCFTSJ3V53AXS5QVMZW0NYEC';
var client_secret = '3M20TNVH54M2YTEIVW4GVN2FXOCKHVTARIUMHITUA0BORPUP';
var registered_redirect_uri = 'http://localhost:3000/callback';

var users = [{"username":"asdf","uuid":"ABCD-EFGH-IJKL","endpoint":"http://localhost:3000/messages/asdf","messages":[]},
			 {"username":"jkl","uuid":"ABCD-EFGH-MNOP","endpoint":"http://localhost:3000/messages/jkl","messages":[]},
			 {"username":"last","uuid":"ABCD-EFGH-WXYZ","endpoint":"http://localhost:3000/messages/last","messages":[]}];

var config = {
  	'secrets' : {
    		'clientId' : client_id,
    		'clientSecret' : client_secret,
    		'redirectUrl': registered_redirect_uri
  	}
}

var foursquare = require('node-foursquare')(config);

app.set('views', path.join(__dirname, 'views'));

//app.use(router);
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '/js')));

var port = 3000;
var num_of_processes = 3;

if(cluster.isMaster){
		console.log(`Master ${process.pid} is running`);

		// Fork workers.
		for (var i = 0; i < num_of_processes; i++) {
				cluster.fork();
		}

		cluster.on('exit', (worker, code, signal) => {
				console.log(`worker ${worker.process.pid} died`);
		});
}
else {
		http.createServer(app).listen(port);
		//https.createServer(options, app).listen(443);
		console.log(`Worker ${process.pid} started`);
		port++;
}

console.log('It\'s running!');

//app.listen(80);
app.get('/', function (req, res) {
//  console.log('req is: ' + req.headers);
//  var headers = JSON.stringify(req.headers);
//  var query = JSON.stringify(req.query);
//  var body = [];
//  req.on('data', function(chunk) {
//    body.push(chunk);
//  }).on('end', function() {
//    body = Buffer.concat(body).toString();
//  });

//  console.log(query);
//  var sendme = headers + ',' + query + ',' + body;

//  res.json(sendme);
  	console.log('Redirecting to /home');
  	res.redirect('/login');
});

app.get('/home', function (req, res) {
  	console.log('Arriving at index.html');
  	res.sendFile(path.join(__dirname+'/views/index.html'));
});

app.get('/login', function (req, res) {
  	console.log('Arriving at Login page');
  	//res.writeHead(303, { 'location': foursquare.getAuthClientRedirectUrl() });
  	//res.end();
  	res.sendFile(path.join(__dirname+'/views/login.html'));

});

function userIsFound(username, callback) {
    	console.log('in userIsFound');
    	for (var i = 0; i < users.length; i++){

      		if(users[i].username === username) {
			console.log('SUCCESS!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
			callback(users[i].uuid);
			return true;
      		}
    	}

		console.log('username not found');
    	return false;
}

app.get('/callback', function (req, res) {
  	console.log('callback called');

  	//foursquare.getAccessToken({
  	//    code: req.query.code
  	//  },
  	//  function (error, accessToken) {
  	//    if(error) {
  	//      res.send('An error was thrown: ' + error.message);
  	//    }
  	//    else {
	// Save the accessToken and redirect.
	      //
	//open file and create it if it doesn't exist
	//var file = fs.readFileSync('./tokens.json');

	//var file = fs.readFileSync('./profiles.json');
	//var jsonFile = JSON.parse(file);
	var username = req.query.username;
	var uuid = '';

	console.log('username is ' + username);

	//console.log('*****file contents = ' + jsonFile);

	/*if (jsonFile === ''){
	  	console.log('empty file: creating new array');
	  	console.log('THIS SHOULD NEVER HAPPEN*****************************************');

	  	var str = '[]';

	  	var db = JSON.parse(str);

	  	//db.push({"accessToken":accessToken});
	  	db.push
	  	var json = JSON.stringify(db);

    	  	console.log('json file is ' + json);

	  	fs.writeFileSync('./tokens.json', json, 'utf8');

	}*/
    	//else {
	  	//console.log('searching for username in json file');

    	  	//console.log('file is ' + jsonFile);

	  	if(!userIsFound(username, function(found_uuid){uuid = found_uuid;})){
	    	//console.log('user not found: adding user');
	    	//console.log('jsonFile before = ' + jsonFile);
			uuid = uuidV4();

			var empty_array = [];
			var endpoint = "http://localhost:3000/messages/" + username;
			var newEntry = {"username":username,"uuid":uuid,"endpoint":endpoint,"messages":empty_array};
			users.push(newEntry);
      	    //jsonFile.push(newEntry);

	    	//console.log('jsonFile after = ' + jsonFile);

	    	//fs.writeFileSync('./profiles.json', JSON.stringify(jsonFile), 'utf8');
		}
	  	else{
	    	//token exists
	    	console.log('profile found and logged in');

	  	}
	//}
        res.redirect('/messages?username=' + username + '&uuid=' + uuid);
   //   }

   // });
});

app.get('/profile', function (req, res) {
  	console.log('arrived at profile page');
  	console.log('access token is ' + req.query);
  	res.sendFile(path.join(__dirname+'/views/profile.html'));
});

app.get('/messages', function (req, res) {
  	res.sendFile(path.join(__dirname+'/views/messages.html'));
	console.log('arrived at messages page');
});

function getUser(username) {
	for (var user of users) {
		if(user.username === username){
			return user;
		}
	}
	return null;
}

//return the messages that the user currently has
app.get('/messages/:username', function(req, res) {
	var user = getUser(req.params.username);
	if (user !== null){
		res.send(JSON.stringify(user.messages));
	}
	else {
		res.send('no user by that name is registered');
	}
});

//adds a message to the user indicated
//AND returns a list of the current users
app.post('/messages/:username', function (req, res) {
	//retrieve the messages from the user whose username is specified

	//t = getMessage();
	//if (  isRumor(t)  ) {
	//	store(t)
	var user = getUser(req.params.username);
	if (user !== null){
		console.log('body is ' + JSON.stringify(req.body));

		user.messages.push(req.body);
		res.end(JSON.stringify(users));
	}
	//} elsif ( isWant(t) ) {
    //work_queue = addWorkToQueue(t)
    //foreach w work_queue {
    //  s = prepareMsg(state, w)
    //  <url> = getUrl(w)
    //  send(<url>, s)
    //  state = update(state, s)
    //}
	//}
});

app.get('/users', function (req, res) {
	res.send(users);
});

app.get('/rd', function (req, res) {
  	for(query in req.query){
    		if (query === 'google') {
      			console.log('redirecting to Google');
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
