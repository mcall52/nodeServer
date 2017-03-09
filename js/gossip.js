var script = document.createElement('script');
script.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js';
script.type = 'text/javascript';
document.getElementsByTagName('head')[0].appendChild(script);

//create list of messages
//var allMessages = [];

//allMessages is an array of message objects which look like:
//{"Rumor" : {"MessageID": "ABCD-1234-ABCD-1234-ABCD-1234:5" ,
//           "Originator": "Phil",
//           "Text": "Hello World!"
//           },
// "EndPoint": "https://example.com/gossip/13244"
//}
//that way new messages can be added from other sources and a name will be displayed
//and all the info necessary to make more "Want" and "Rumor" records is stored

var messages_sent_count = 0;
var RUMOR = 0;
var WANT = 1;

function send_message() {
	console.log('send_message() called');
	
	messages_sent_count++;
	var messageID = window.sessionStorage.username + ":" + messages_sent_count;
	var message = $("#message").val();
	var endpoint = "http://localhost:3000/messages/" + window.sessionStorage.username;
	
	var new_message = {"Rumor" : {"MessageID": messageID,
		"Originator": window.sessionStorage.username,
		"Text": message},"EndPoint":endpoint};
		
	//var allMessages = JSON.parse(sessionStorage.getItem('allMessages'));
	
	//allMessages.push(new_message);
	$.post("http://localhost:3000/messages/"+sessionStorage.username, new_message, function(data){
		console.log('list of peers data is ' + data);
		sessionStorage.peers = JSON.parse(data);
	});
	
	//print_messages();
	
	//call Gossip protocol - maybe
}

function print_messages() {
	var allMessages = [];
	
	$.get("http://localhost:3000/messages/"+sessionStorage.username, function(data) {
		console.log("messages retrieved!");
		//console.log('page content: ' + data);
		allMessages = JSON.parse(data);
		
		var message_thread = '';
		for(var i = 0; i < allMessages.length; i++){
			var temp_message = '<div id=' + allMessages[i].Rumor.MessageID + '><p>'
					+ allMessages[i].Rumor.Originator + ': ' + allMessages[i].Rumor.Text + '</p></div>';
			message_thread += temp_message;
		}

		//sessionStorage.setItem('allMessages', JSON.stringify(allMessages));
		$("#messages").html(message_thread);
	});	
}

function gossip(){
	console.log('gossip function called');
	
	while(true){
		//execute gossip protocol
		//q = getPeer(state)
		var peer = getPeer();
		console.log('peer is ' + peer.username);
		//s = prepareMsg(state, q)
		var message;
		//<url> = lookup(q)
		//send (<url>, s)
		//$.post(peer.endpoint, message, function(data) {
			
		//});
		print_messages();
		//sleep n
		sleep(2000);
	}
}

//returns a peer from the local storage.
function getPeer(){
	var peers = sessionStorage.peers;
	var index = Math.floor(Math.random() * peers.length);
	var peer = peers[index];
	console.log('peer chosen is ' + peer.username);
	while(peer.username !== sessionStorage.username){
		//remove self from list
		peers.splice(index, 1);
		peer = peers[Math.floor(Math.random() * peers.length)];
		console.log('peer chosen was self');
		
	}
	
	console.log('peer chosen is ' + peer.username);
	return peer;
}

function prepareMessage(state, peer){
	//randomly pick "rumor" or "want"
	
	var min = Math.ceil(0);
	var max = Math.floor(2);
	var message_type = Math.floor(Math.random() * (max - min)) + min; // this is includes 0 but excludes 2
	
	if(message_type === RUMOR){
		//pick a message and send italic
		console.log('message_type == rumor');
		$.post(peer.endpoint, state, function(data){
			
		});
	}
	else if (message_type === WANT){
		
	}
}

function sleep(milliseconds) {
	var start = new Date().getTime();
	for (var i = 0; i < 1e7; i++) {
		if ((new Date().getTime() - start) > milliseconds){
			break;
		}
	}
}


