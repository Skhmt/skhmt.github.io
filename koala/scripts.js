
/* this is the (public) client_id of StreamKoala. */
var clientid = "idc20bfbuv46327tp8jgc6qhznewz9";
var username = "";
var access_token = "";
var viewersStatus = "";
var followersStatus = "";
var setupChatAndVideo = false;
var allHosts = [];
var refreshRate = 5; //in seconds

/* If there's no auth, send the user to the front page */
if (document.location.hash.length < 50) {
	window.location = "http://skhmt.github.io";
}
access_token = document.location.hash.substring(14,44);

getUsername();

function getUsername() {
	var script0 = document.createElement("script");
	script0.src = "https://api.twitch.tv/kraken?callback=kraken2&oauth_token=" + access_token + "&client_id=" + clientid;
	document.body.appendChild(script0);
}

function kraken2(userdata) {
	username = userdata.token.user_name;
}


// Setting up the main page area
loadScript();

/* HOSTS BROKEN
var pageOpen = new Date()
document.getElementById("hostsTop").innerHTML = "Hosts since " + ("0" + pageOpen.getHours()).slice(-2) + ":" + ("0" + pageOpen.getMinutes()).slice(-2) + " " + pageOpen.toLocaleDateString();
*/

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
		document.getElementById("twitchChat").data="http://www.twitch.tv/" + username + "/chat";
		document.getElementById("twitchChat").style.display = "block";
		
		document.getElementById("twitchVideo").data="http://www.twitch.tv/" + username + "/embed";
		document.getElementById("twitchVideo").style.display = "block";
		setupChatAndVideo = true;
	}
	
	setTimeout(loadScript, refreshRate*1000);
}

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
	
	output += "<b>" + chatroom.display_name + "</b>";
	output += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
	output += "<b><button onclick=\"updateGameName('" + chatroom.game + "')\">Game</button></b> ";
	output += chatroom.game;
	output += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
	output += "<b><button onclick=\"updateStatus('" + chatroom.status + "')\">Status</button></b> ";
	output += chatroom.status;
	
	var output2 = "<span class='streamKoalaName'>StreamKoala</span>";
	
	document.getElementById("userinfo").innerHTML = output2 + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + output;
	
	/* update hosts */
	/* HOSTS ARE BROKEN RIGHT NOW
	var script4 = document.createElement("script");
	script4.src = "http://tmi.twitch.tv/hosts?include_logins=1&target=" + chatroom._id + "&callback=hosts&client_id=" + clientid + "&api_version=3";
	document.body.appendChild(script4);
	*/
}
/*
function hosts(hostlist) {
	for (var i = 0; i < hostlist.length; i++) {
		var newHost = true;
		for (var j = 0; j < allHosts.length; j++) {
			if (hostlist[i].host_login == allHosts[j].name){
				newHost = false;
				break;
			}
		}
		if (newHost) {
			alert("pushing: " + hostlist[i].host_login);
			allHosts.push(
				{"name": hostlist[i].host_login, "time": new Date()}
			);
		}
	}
	
	//updating the list
	var output = "";
	for (var i = 0; i < allHosts.length; i++) {
		var d = allHosts[i].time;
		output += allHosts[i].name + " (" + ("0" + d.getHours()).slice(-2) + ":" + ("0" + d.getMinutes()).slice(-2) + ")<br />";
	}
	document.getElementById("hostsBottom").innerHTML = output;
}
*/

function updateGameName(gameName) {
	var newGame = prompt("Enter a new game name below. Changes take a moment to appear on StreamKoala.", gameName);
	
	//change spaces to + signs
	for (var i = 0; i < newGame.length; i++) {
		newGame = newGame.replace(" ", "+");
	}
	
	var xhr = new XMLHttpRequest();
	var url = "https://api.twitch.tv/kraken/channels/" + username + "?channel[game]=" + newGame + "&_method=put&oauth_token=" + access_token;
	xhr.open("GET", url, true);
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.send();
}

function updateStatus(statusText) {
	var newStatus = prompt("Enter a new stream status below. Changes take a moment to appear on StreamKoala.", statusText);
	
	//change spaces to + signs
	for (var i = 0; i < newStatus.length; i++) {
		newStatus = newStatus.replace(" ", "+");
	}
	
	var xhr = new XMLHttpRequest();
	var url = "https://api.twitch.tv/kraken/channels/" + username + "?channel[status]=" + newStatus + "&_method=put&oauth_token=" + access_token;
	xhr.open("GET", url, true);
	xhr.setRequestHeader("Content-type", "application/json");
	xhr.send();
}

