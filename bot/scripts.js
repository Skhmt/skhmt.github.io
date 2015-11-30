

/* vars */
var clientid = "idc20bfbuv46327tp8jgc6qhznewz9"; /* this is the (public) client_id of StreamKoala. */
var username = "";
var channel = "";
var access_token = "";
var irc = "";
var bot = "";
var server = "irc.twitch.tv";

$(document).ready(function(){
	
	var fs = require("fs");
	var path = require("path");
	
	var execPath = path.dirname(process.execPath);
	execPath += "\\info.ini";
	var readFile = fs.readFileSync(execPath);
	var data = JSON.parse( readFile );
	
	access_token = data.oauth;
	username = data.username;
	channel = "#" + username;
	
	log("* Username: "+username);
	
	runBot();
});

function runBot() {
	
	irc = require("irc");
	
	var config = {
		channels: [channel],
		server: server,
		username: username,
		nick: username,
		password: access_token,
		sasl: true,
		autoConnect: false
	};
	
	bot = new irc.Client(config.server, config.nick, config);
	
	bot.connect(5, function(){
		log("* Connected to " + server);
	});
	
	bot.addListener("registered", function(message){
		bot.send("CAP REQ", "twitch.tv/membership");
		bot.send("CAP REQ", "twitch.tv/commands");
	});
	
	bot.addListener("join" + channel, function(nick, message){
		log("* " + nick + " has joined " + channel);
	});
	
	bot.addListener("part" + channel, function(nick, reason, message){
		log("* " + nick + " has left " + channel);
	});
	
	bot.addListener("error", function(message){
		log("* Error: " + message);
	});
	
	bot.addListener("message", function(from, to, text, message){
		log(getTS() + " " + from + ":&nbsp;&nbsp;" + text);
	});
	
	bot.addListener("action", function(from, to, text, message){
		log(getTS() + " " + from + " " + text);
	});
}

function say(message) {
	bot.say(channel, message);
}

function log(message) {
	var out = document.getElementById("console");
	// allow 1px inaccuracy by adding 1
	var isScrolledToBottom = out.scrollHeight - out.clientHeight <= out.scrollTop + 1;
	
	$("#console").append(message + "<br />");
	
	if(isScrolledToBottom)
		out.scrollTop = out.scrollHeight - out.clientHeight;
}

function chat() {
	var text = $("#chatText").val();
	say(text);
	log("* " + getTS() + " " + username + ":&nbsp;&nbsp;" + text);
	
	$("#chatText").val("");
}

function getTS() {
	var dt = new Date();
	var hrs = dt.getHours();
	var mins = dt.getMinutes();
	var secs = dt.getSeconds();
	
	if (hrs < 10) hrs = "0" + hrs;
	if (mins < 10) mins = "0" + mins;
	if (secs < 10) secs = "0" + secs;
	
	return "[" + hrs + ":" + mins + "]";
}