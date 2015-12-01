

/* vars */
var clientid = "idc20bfbuv46327tp8jgc6qhznewz9"; /* this is the (public) client_id of StreamKoala. */
var username = "";
var channel = "";
var access_token = "";
var irc = "";
var bot = "";
var server = "irc.twitch.tv";
var fs;
var logFile;
var execPath;
var hosts = [];
var hostFile;
var id = "";

$(document).ready(function(){
	
	// Setting up jQuery elements
	$("#tabs").tabs();

	// Setting up file read stuff and variables
	fs = require("fs");
	var path = require("path");
	
	execPath = path.dirname(process.execPath);
	var readFile = fs.readFileSync(execPath + "\\info.ini");
	var data = $.parseJSON( readFile );
	
	access_token = data.oauth;
	username = data.username;
	channel = "#" + username;
	
	// Set up the chat log
	var d = new Date();
	var dmonth = d.getMonth() < 10 ? "0" + d.getMonth() : d.getMonth();
	var dday = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
	var dhour = d.getHours() < 10 ? "0" + d.getHours() : d.getHours();
	var dmin = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
	var dsec = d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds();
	var logname = "chatlog_" + d.getFullYear() + "-" + dmonth + "-" + dday + "_" + dhour + "-" + dmin + "-" + dsec + ".log";
	logFile = execPath + "\\" + logname;

	/*
	var firstLogLine =  d.getFullYear() + "-" + dmonth + "-" + dday + " " + dhour + ":" + dmin + ":" + dsec + "\r\n";
	firstLogLine += "-------------------\r\n";
	fs.appendFile(logFile, firstLogLine, function (err) {
		if (err) {
			$("#console").append("* Error writing to log" + "<br />");
		}
	});
	*/

	// Running tabs
	runChat();
	getHosts();

});

function runChat() {
	
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
		log(getTimeStamp() + " " + from + ": " + text);
	});
	
	bot.addListener("action", function(from, to, text, message){
		log(getTimeStamp() + " " + from + " " + text);
	});
}

function log(message) {
	var out = document.getElementById("console");
	// allow 1px inaccuracy by adding 1
	var isScrolledToBottom = out.scrollHeight - out.clientHeight <= out.scrollTop + 1;
	
	$("#console").append(message + "<br />");
	
	if(isScrolledToBottom)
		out.scrollTop = out.scrollHeight - out.clientHeight;

	// write to log
	fs.appendFile(logFile, message + "\r\n", function (err) {
		if (err) {
			$("#console").append("* Error writing to log" + "<br />");
		}
	});
}

function chat() {
	var text = $("#chatText").val();
	bot.say(channel, text);
	log(getTimeStamp() + " " + username + ": " + text);
	
	$("#chatText").val("");
}

function getTimeStamp() {
	var dt = new Date();
	var hrs = dt.getHours();
	var mins = dt.getMinutes();
	var secs = dt.getSeconds();
	
	if (hrs < 10) hrs = "0" + hrs;
	if (mins < 10) mins = "0" + mins;
	if (secs < 10) secs = "0" + secs;
	
	return "[" + hrs + ":" + mins + "]";
}

function getHosts() {
	hostFile = execPath + "\\hosts.log";
	fs.writeFile(hostFile, "", function (err) {
		if (err) {
			log("* Error clearing the host file");
		}
	});

	// get id
	$.getJSON(
		"https://api.twitch.tv/kraken/channels/" + username,
		{
			"client_id" : clientid,
			"api_version" : 3
		},
		function(response){
			id = response._id;

			checkHosts()
		}
	);
}

function checkHosts() {
	// get hosts into json
	var newHosts = [];
	$.getJSON(
		"http://tmi.twitch.tv/hosts",
		{
			"include_logins" : "1",
			"target" : id
		},
		function(response){
			for (var i = 0; i < response.hosts.length; i++){
				newHosts.push(response.hosts[i].host_login);
			}

			updateHosts(newHosts);
			return setTimeout(checkHosts(), 10*1000);
		}
	);
}

function updateHosts(newHosts){
	for (var i = 0; i < newHosts.length; i++){
		if (hosts.indexOf(newHosts[i]) == -1) { // if the host is not in the current list of hosts 
			var theHost = newHosts[i];
			hosts.push(theHost); // add to the list of hosts to prevent duplicates
			$("#hosts").append(getTimeStamp() + " " + theHost + "<br />"); // adding to the hosts tab
			log("* " + getTimeStamp() + " " + theHost + " is hosting you"); // logging it

			// write to host file
			fs.appendFile(hostFile, theHost + "\r\n", function (err) {
				if (err) {
					log("* Error writing to host file");
				}
			});
		}
	}
}
