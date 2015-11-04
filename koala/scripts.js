
/* this is the (public) client_id of StreamKoala. */
var clientid = "idc20bfbuv46327tp8jgc6qhznewz9";

var accessToken = document.location.hash;

document.body.innerHTML+=accessToken;

var username;
function setTwitchName() {
	username = document.getElementById("twitchName").value.toLowerCase();

	// Hiding the initial input area
	document.getElementById("nameArea").style.display = "none";
	
	
	// Setting up the main page area
	if (document.getElementById("nbAutoDJBox").checked) document.getElementById("nbAutoDJ").style.display = "block";
	document.getElementById("twitchChat").data="http://www.twitch.tv/" + username + "/chat";
	horizontalSizeElements();
	loadScript();
	
	document.getElementById("pageArea").style.display = "block";
}

function horizontalSizeElements() {
	
}

function loadScript() {
	var script1 = document.createElement("script");
	script1.src = "https://tmi.twitch.tv/group/user/" + username + "/chatters?callback=userlist&client_id=" + clientid;
	document.body.appendChild(script1);
	
	var script2 = document.createElement("script");
	script2.src = "https://api.twitch.tv/kraken/channels/" + username + "/?callback=streaminfo&client_id=" + clientid;
	document.body.appendChild(script2);
	
	var script3 = document.createElement("script");
	script3.src = "https://api.twitch.tv/kraken/channels/" + username + "/follows/?callback=followers&client_id=" + clientid;
	document.body.appendChild(script3);
	
	
	setTimeout(loadScript, 5*1000); //refresh viewers every 5 seconds, twitch only updates the api every ~30-60 seconds or so
}

var viewersStatus = "";
var followersStatus = "";
function updateFollowersAndViewers() {
	if (viewersStatus != "" && followersStatus != "") {
		document.getElementById("twitchChatViewers").innerHTML = "<img src='viewers.png' width='10' height='10' /> " + viewersStatus + "&nbsp;&nbsp;&nbsp; <img src='followers.png' width='12' height='10' /> " + followersStatus;
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
		output += "<p> <span class='viewerType'>STAFF (" + chatroom.data.chatters.staff.length + ")</span> <br /> ";
		var i;
		for (i = 0; i < chatroom.data.chatters.staff.length; i++) {
			output += chatroom.data.chatters.staff[i] + " <br /> ";
		}
		output += "</p> ";
	}
	
	if (chatroom.data.chatters.moderators.length > 0) {
		output += "<p> <span class='viewerType'>MODERATORS (" + chatroom.data.chatters.moderators.length + ")</span> <br /> ";
		var i;
		for (i = 0; i < chatroom.data.chatters.moderators.length; i++) {
			output += chatroom.data.chatters.moderators[i] + " <br /> ";
		}
		output += "</p> ";
	}
	
	if (chatroom.data.chatters.admins.length > 0) {
		output += "<p> <span class='viewerType'>ADMINS (" + chatroom.data.chatters.admins.length + ")</span> <br /> ";
		var i;
		for (i = 0; i < chatroom.data.chatters.admins.length; i++) {
			output += chatroom.data.chatters.admins[i] + " <br /> ";
		}
		output += "</p> ";
	}
	
	if (chatroom.data.chatters.global_mods.length > 0) {
		output += "<p> <span class='viewerType'>GLOBAL MODS (" + chatroom.data.chatters.global_mods.length + ")</span> <br /> ";
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
	
	document.getElementById("twitchChatUsers").innerHTML = output;
}

function streaminfo(chatroom) {
	var output = "";
	
	output += "<b>" + chatroom.display_name + "</b> | ";
	output += "<b>Game:</b> " + chatroom.game + " | ";
	output += "<b>Status:</b> " + chatroom.status;
	
	var output2 = "<span class='streamKoalaName'>StreamKoala</span>";
	
	document.getElementById("userinfo").innerHTML = output2 + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + output;
}