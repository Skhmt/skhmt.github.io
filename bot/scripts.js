

/* vars */
var clientid = "idc20bfbuv46327tp8jgc6qhznewz9"; /* this is the (public) client_id of StreamKoala. */
var bot;
var server = "irc.twitch.tv";
var fs;
var logFile;
var execPath;
var hosts = [];
var hostFile;
var settings = {access_token:"", username:"", channel:""};
var viewers = [];

$(document).ready(function(){
	
	// Setting up jQuery elements
	var gui = require("nw.gui")
	var win = gui.Window.get();


	$("#tabs").tabs();

	$("#getOauthDialog").dialog({
		autoOpen: false,
		modal: true,
		height: 580,
		width: 700	
	});

	$("#getOauthLink").button().click(function(){
		$("#getOauthDialog").dialog("open");
	});

	$("#configSave").button().click(function(){
		var newoauth = $("#getOauthField").val();
		var newchan = $("#getChannelField").val();
		if( settings.access_token != newoauth ){ // if you're changing user
			settings.access_token = newoauth;
			getUsername();
		}
		else if ( settings.channel != newchan ){ // if you're not changing user but are changing channel
			settings.channel = newchan;
			bot.join(settings.channel, function(){
				save();
				getHosts();
			});
		}

	});

	// window control jQuery elements
	$("#exit").button({
		text: false,
		icons: {
			primary: "ui-icon-close"
		}
	}).click(function(event){
		win.close();
	});
	$("#minimize").button({
		text: false,
		icons: {
			primary: "ui-icon-minusthick"
		}
	}).click(function(event){
		win.minimize();
	});
	$("#maximize").button({
		text: false,
		icons: {
			primary: "ui-icon-arrowthick-1-ne"
		}
	}).click(function(event){
		var options;
		if ( $( this ).text() === "maximize" ) {
			options = {
				label: "unmaximize",
				icons: {
					primary: "ui-icon-arrowthick-1-sw"
				}
			};
			win.maximize();
		} else {
			options = {
				label: "maximize",
				icons: {
					primary: "ui-icon-arrowthick-1-ne"
				}
			};
			win.unmaximize();
		}
		$( this ).button( "option", options );
	});

	// Setting up file read stuff and variables
	fs = require("fs");
	var path = require("path");
	
	execPath = path.dirname(process.execPath);

	// Setting up the chat log
	var d = new Date();
	var dmonth = d.getMonth() < 10 ? "0" + d.getMonth() : d.getMonth();
	var dday = d.getDate() < 10 ? "0" + d.getDate() : d.getDate();
	var dhour = d.getHours() < 10 ? "0" + d.getHours() : d.getHours();
	var dmin = d.getMinutes() < 10 ? "0" + d.getMinutes() : d.getMinutes();
	var dsec = d.getSeconds() < 10 ? "0" + d.getSeconds() : d.getSeconds();
	var logname = "chatlog_" + d.getFullYear() + "-" + dmonth + "-" + dday + "_" + dhour + "-" + dmin + "-" + dsec + ".log";
	logFile = execPath + "\\" + logname;

	try {
		var readFile = fs.readFileSync(execPath + "\\settings.ini");
		var data = $.parseJSON( readFile );
		settings = data;

		// Setting up config area
		$("#getOauthField").val(settings.access_token);
		$("#getChannelField").val(settings.channel);
		$("#displayName").html(settings.username);

		// Running tabs
		runChat();
		getHosts();
	} catch (e) {
		$("#getOauthField").val("oauth:...");
	}

	
});

function getUsername() {
	var token = settings.access_token.substring(6);
	$.getJSON(
		"https://api.twitch.tv/kraken",
		{
			"client_id" : clientid,
			"api_version" : 3,
			"oauth_token" : token	
		},
		function(response){
			settings.username = response.token.user_name;
			$("#displayName").html(settings.username);
			
			settings.channel = "#"+settings.username;
			$("#getChannelField").val(settings.channel);

			save();	
			runChat();
			getHosts();
		}
	);
}


function runChat() {
	
	var irc = require("irc");
	
	var config = {
		//channels: [settings.channel],
		server: server,
		username: settings.username,
		nick: settings.username,
		password: settings.access_token,
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
		bot.join(settings.channel, function(){
			// nothing?
		});
	});
	
	bot.addListener("join", function(channel, nick, message){
		if (settings.channel == channel) {
			log("* " + nick + " has joined " + channel);
			viewers.push(nick);
		}
	});
	
	bot.addListener("part", function(channel, nick, reason, message){
		if (settings.channel == channel) {
			log("* " + nick + " has left " + channel);
			delete viewers[viewers.indexOf(nick)];
		}
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

	bot.addListener("notice", function(nick, to, text, message){
		log("* " + text);
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
	bot.say(settings.channel, text);
	log(getTimeStamp() + " " + settings.username + ": " + text);
	
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
	
	// clearing the host file, hosts tab, and the list of hosts
	fs.writeFileSync(hostFile, "");
	$("#hosts").html("");
	hosts = [];

	// get id of the channel you're in
	$.getJSON(
		"https://api.twitch.tv/kraken/channels/" + settings.channel.substring(1),
		{
			"client_id" : clientid,
			"api_version" : 3
		},
		function(response){
			settings.id = response._id;
			save();
			checkHosts();
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
			"target" : settings.id
		},
		function(response){
			for (var i = 0; i < response.hosts.length; i++){
				newHosts.push(response.hosts[i].host_login);
			}

			updateHosts(newHosts);
			updateUserlist();
			return setTimeout(checkHosts(), 10*1000);
		}
	);
}

function updateHosts(newHosts){
	for (var i = 0; i < newHosts.length; i++){
		var theHost = newHosts[i];
		if (hosts.indexOf(theHost) == -1) { // if the host is not in the current list of hosts 
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

function save(){
	fs.writeFile(execPath + "\\settings.ini", JSON.stringify(settings), function (err) {
		if (err) {
			log("* Error saving settings");
		}
	});
}


function updateUserlist() {
	$.getJSON(
		"https://tmi.twitch.tv/group/user/" + settings.channel.substring(1) + "/chatters",
		{
			"client_id" : clientid,
			"api_version" : 3
		},
		function(response){
			var output = "<b>Total viewers</b>: " + response.chatter_count + "<br />"; 

			var staffLen = response.chatters.staff.length;
			if (staffLen > 0) {
				output += "<p> <b>STAFF (" + staffLen + ")</b> <br /> ";
				for (var i = 0; i < staffLen; i++) {
					output += response.chatters.staff[i] + " <br /> ";
				}
				output += "</p> ";
			}

			var modLen = response.chatters.moderators.length;
			if (modLen > 0) {
				output += "<p> <b>MODERATORS (" + modLen + ")</b> <br /> ";
				for (var i = 0; i < modLen; i++) {
					output += response.chatters.moderators[i] + " <br /> ";
				}
				output += "</p> ";
			}

			var adminLen = response.chatters.admins.length;
			if (adminLen > 0) {
				output += "<p> <b>ADMINS (" + adminLen + ")</b> <br /> ";
				for (var i = 0; i < adminLen; i++) {
					output += response.chatters.admins[i] + " <br /> ";
				}
				output += "</p> ";
			}

			var globalLen = response.chatters.global_mods.length;
			if (globalLen > 0) {
				output += "<p> <b>GLOBAL MODS (" + globalLen + ")</b> <br /> ";
				for (var i = 0; i < globalLen; i++) {
					output += response.chatters.global_mods[i] + " <br /> ";
				}
				output += "</p> ";
			}

			var viewLen = response.chatters.viewers.length;
			if (viewLen > 0) {
				output += "<p> <b>VIEWERS (" + viewLen + ")</b> <br /> ";
				for (var i = 0; i < viewLen; i++) {
					output += response.chatters.viewers[i] + " <br /> ";
				}
				output += "</p> ";
			}

			$("#userlist").html(output);
		}
	);
}
