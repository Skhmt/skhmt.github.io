/* vars */
var clientid = "idc20bfbuv46327tp8jgc6qhznewz9"; /* this is the (public) client_id of StreamKoala. */
var username = "";
var access_token = "";
var viewersStatus = "";
var followersStatus = "";
var setupChatAndVideo = false;
var allHosts = [];
var refreshRate = 5; //in seconds

/* waiting until the page is loaded before doing stuff */
$(document).ready(function(){
	/* If there's no auth, send the user to the login page */
	if (document.location.hash.length < 50) {
		window.location = "https://api.twitch.tv/kraken/oauth2/authorize?response_type=token&client_id=idc20bfbuv46327tp8jgc6qhznewz9&redirect_uri=http://skhmt.github.io/koala&scope=channel_editor&force_verify=true";
	}
	access_token = document.location.hash.substring(14,44);

	/* masking url, specifically the access_token */
	history.pushState({}, "masked url", "/");

	/* Detecting browser... if mobile, remove the videos and resize the remaining elements. */
	if (
		navigator.userAgent.match(/Android/i)
		|| navigator.userAgent.match(/webOS/i)
		|| navigator.userAgent.match(/iPhone/i)
		|| navigator.userAgent.match(/iPad/i)
		|| navigator.userAgent.match(/iPod/i)
		|| navigator.userAgent.match(/BlackBerry/i)
		|| navigator.userAgent.match(/Windows Phone/i) ) {
		$("#videoLI").hide(); /* 30% default */
		$("#chatLI").width("45%"); /* 30% default */
		$("#viewersLI").width("20%"); /* 12% default */
		$("#taLI").width("31%"); /* 25% default */
		/* 97% is the max width */
	}

	$("#lowerbox").sortable({
		handle: ".handle"
	});
	
	/* Getting the username from api.twitch.tv/kraken/ */
	getUsername();
	
	$("#gameButton").button().click(function(event){
		
	});
	
}); // close $(document).ready


function getUsername() {
	var script0 = document.createElement("script");
	script0.src = "https://api.twitch.tv/kraken?callback=kraken2&oauth_token=" + access_token + "&client_id=" + clientid;
	document.body.appendChild(script0);
}

function kraken2(userdata) {
	username = userdata.token.user_name;
	
	/* Set up the main page area */
	loadScript();
}


function loadScript() {
	var script1 = document.createElement("script");
	script1.src = "https://tmi.twitch.tv/group/user/" + username + "/chatters?callback=userlist&client_id=" + clientid + "&api_version=3";
	document.body.appendChild(script1);
	
	var script2 = document.createElement("script");
	script2.src = "https://api.twitch.tv/kraken/channels/" + username + "/?callback=streaminfo&client_id=" + clientid + "&api_version=3";
	document.body.appendChild(script2);
	
	var script3 = document.createElement("script");
	script3.src = "https://api.twitch.tv/kraken/channels/" + username + "/follows/?callback=followers&client_id=" + clientid + "&api_version=3";
	document.body.appendChild(script3);
	
	if(setupChatAndVideo == false && username != "") {
		$("#twitchChat").attr("src", "http://www.twitch.tv/" + username + "/chat");
		
		$("#twitchVideo").attr("src", "http://www.twitch.tv/" + username + "/embed");
		setupChatAndVideo = true;
	}
	
	setTimeout(loadScript, refreshRate*1000);
}

function updateFollowersAndViewers() {
	if (viewersStatus != "" && followersStatus != "") {
		$("#twitchChatViewers").html("<img src='http://skhmt.github.io/koala/viewers.png' width='10' height='10' /> " + viewersStatus + "&nbsp;&nbsp;&nbsp; <img src='http://skhmt.github.io/koala/followers.png' width='12' height='10' /> " + followersStatus);
		viewersStatus = "";
		followersStatus = "";
	}
}

function followers(chatroom) {
	followersStatus = chatroom._total;
	updateFollowersAndViewers();
}

function userlist(chatroom) {
	
	viewersStatus = chatroom.data.chatter_count;
	updateFollowersAndViewers();
	
	var output = ""; 
	
	if (chatroom.data.chatters.staff.length > 0) {
		output += "<p> <img src='http://chat-badges.s3.amazonaws.com/staff.png' /> <span class='viewerType'>STAFF (" + chatroom.data.chatters.staff.length + ")</span> <br /> ";
		var i;
		for (i = 0; i < chatroom.data.chatters.staff.length; i++) {
			output += chatroom.data.chatters.staff[i] + " <br /> ";
		}
		output += "</p> ";
	}
	
	if (chatroom.data.chatters.moderators.length > 0) {
		output += "<p> <img src='http://chat-badges.s3.amazonaws.com/mod.png' /> <span class='viewerType'>MODERATORS (" + chatroom.data.chatters.moderators.length + ")</span> <br /> ";
		var i;
		for (i = 0; i < chatroom.data.chatters.moderators.length; i++) {
			output += chatroom.data.chatters.moderators[i] + " <br /> ";
		}
		output += "</p> ";
	}
	
	if (chatroom.data.chatters.admins.length > 0) {
		output += "<p> <img src='http://chat-badges.s3.amazonaws.com/admin.png' /> <span class='viewerType'>ADMINS (" + chatroom.data.chatters.admins.length + ")</span> <br /> ";
		var i;
		for (i = 0; i < chatroom.data.chatters.admins.length; i++) {
			output += chatroom.data.chatters.admins[i] + " <br /> ";
		}
		output += "</p> ";
	}
	
	if (chatroom.data.chatters.global_mods.length > 0) {
		output += "<p> <img src='http://chat-badges.s3.amazonaws.com/globalmod.png' /> <span class='viewerType'>GLOBAL MODS (" + chatroom.data.chatters.global_mods.length + ")</span> <br /> ";
		var i;
		for (i = 0; i < chatroom.data.chatters.global_mods.length; i++) {
			output += chatroom.data.chatters.global_mods[i] + " <br /> ";
		}
		output += "</p> ";
	}
	
	if (chatroom.data.chatters.viewers.length > 0) {
		output += "<p> <span class='viewerType'>VIEWERS (" + chatroom.data.chatters.viewers.length + ")</span> <br /> ";
		var i;
		for (i = 0; i < chatroom.data.chatters.viewers.length; i++) {
			output += chatroom.data.chatters.viewers[i] + " <br /> ";
		}
		output += "</p> ";
	}
	
	$("#twitchChatUsers").html(output);
}

function streaminfo(chatroom) {
	var output = "";
	
	output += "<b>" + chatroom.display_name + "</b>";
	output += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
	output += "<b><button onclick=\"updateGameName('" + chatroom.game + "')\">Game</button></b> ";
	output += chatroom.game;
	output += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
	output += "<b><button onclick=\"updateStatus('" + chatroom.status + "')\">Title</button></b> ";
	output += chatroom.status;
	
	var output2 = "<span class='streamKoalaName'>StreamKoala</span>";
	
	$("#userinfo").html(output2 + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + output);
}

function updateGameName(gameName) {
	var newGame = prompt("Enter a new game name below. Changes take a moment to appear on StreamKoala.", gameName);
	
	$.ajax({
		method: "GET",
		url: "https://api.twitch.tv/kraken/channels/" + username,
		data: { "channel[game]": newGame, "_method": "put", "oauth_token": access_token},
		contentType: "application/json"
	});
}

function updateStatus(statusText) {
	var newStatus = prompt("Enter a new stream title below. Changes take a minute to appear on StreamKoala.", statusText);
	
	$.ajax({
		method: "GET",
		url: "https://api.twitch.tv/kraken/channels/" + username,
		data: { "channel[status]": newStatus, "_method": "put", "oauth_token": access_token},
		contentType: "application/json"
	});
}

function setAltTwitchVideo() {
	var newTwitchURL = $("#altTwitchVideoURL").val();
	$("#altTwitchVideo").attr("src", "http://www.twitch.tv/" + newTwitchURL + "/embed");
}