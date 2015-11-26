/* vars */
var clientid = "idc20bfbuv46327tp8jgc6qhznewz9"; /* this is the (public) client_id of StreamKoala. */
var username = "";
var access_token = "";
var viewersStatus = "";
var followersStatus = "";
var setupChatAndVideo = false;
var allHosts = [];
var refreshRate = 5; //in seconds
var updateDialog;
var currentGame = "";
var currentTitle = "";

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

	/* setting up UI elements */
	$("#lowerbox").sortable({
		handle: ".handle"
	});
	
	updateDialog = $("#updateTitles").dialog({
		autoOpen: false,
		modal: true,
		height: 400,
		width: 300,
		buttons: {
			"Update" : updateTitlesSubmit,
			Cancel : function() {
				updateDialog.dialog("close");
			}
		}
	});
	
	$("#changeButton").button().click(setAltTwitchVideo);
	
	/* Getting the username from api.twitch.tv/kraken/ */
	getUsername();
	
}); // close $(document).ready


function getUsername() {
	$.getJSON(
		"https://api.twitch.tv/kraken?callback=?",
		{
			"client_id" : clientid,
			"api_version" : 3,
			"oauth_token" : access_token	
		},
		function(response){
			username = response.token.user_name;
			loadScript();
		}
	);
}

function loadScript() {
	ajaxUserList();
	ajaxStreamInfo();
	ajaxFollowers();

	if(setupChatAndVideo == false && username !== "") {
		$("#twitchChat").attr("src", "http://www.twitch.tv/" + username + "/chat");
		
		$("#twitchVideo").attr("src", "http://www.twitch.tv/" + username + "/embed");
		setupChatAndVideo = true;
	}
	
	setTimeout(loadScript, refreshRate*1000);
}

function ajaxUserList() {
	$.getJSON(
		"https://tmi.twitch.tv/group/user/" + username + "/chatters?callback=?",
		{
			"client_id" : clientid,
			"api_version" : 3
		},
		function(response){
			viewersStatus = response.data.chatter_count;
			updateFollowersAndViewers();

			var output = ""; 

			if (response.data.chatters.staff.length > 0) {
				output += "<p> <img src='http://chat-badges.s3.amazonaws.com/staff.png' /> <span class='viewerType'>STAFF (" + response.data.chatters.staff.length + ")</span> <br /> ";
				for (var i = 0; i < response.data.chatters.staff.length; i++) {
					output += response.data.chatters.staff[i] + " <br /> ";
				}
				output += "</p> ";
			}

			if (response.data.chatters.moderators.length > 0) {
				output += "<p> <img src='http://chat-badges.s3.amazonaws.com/mod.png' /> <span class='viewerType'>MODERATORS (" + response.data.chatters.moderators.length + ")</span> <br /> ";
				for (var i = 0; i < response.data.chatters.moderators.length; i++) {
					output += response.data.chatters.moderators[i] + " <br /> ";
				}
				output += "</p> ";
			}

			if (response.data.chatters.admins.length > 0) {
				output += "<p> <img src='http://chat-badges.s3.amazonaws.com/admin.png' /> <span class='viewerType'>ADMINS (" + response.data.chatters.admins.length + ")</span> <br /> ";
				for (var i = 0; i < response.data.chatters.admins.length; i++) {
					output += response.data.chatters.admins[i] + " <br /> ";
				}
				output += "</p> ";
			}

			if (response.data.chatters.global_mods.length > 0) {
				output += "<p> <img src='http://chat-badges.s3.amazonaws.com/globalmod.png' /> <span class='viewerType'>GLOBAL MODS (" + response.data.chatters.global_mods.length + ")</span> <br /> ";
				for (var i = 0; i < response.data.chatters.global_mods.length; i++) {
					output += response.data.chatters.global_mods[i] + " <br /> ";
				}
				output += "</p> ";
			}

			if (response.data.chatters.viewers.length > 0) {
				output += "<p> <span class='viewerType'>VIEWERS (" + response.data.chatters.viewers.length + ")</span> <br /> ";
				for (var i = 0; i < response.data.chatters.viewers.length; i++) {
					output += response.data.chatters.viewers[i] + " <br /> ";
				}
				output += "</p> ";
			}

			$("#twitchChatUsers").html(output);
		}
	);
}

function ajaxStreamInfo() {
	$.getJSON(
		"https://api.twitch.tv/kraken/channels/" + username + "?callback=?",
		{
			"client_id" : clientid,
			"api_version" : 3
		},
		function(response){
			currentGame = response.game;
			currentTitle = response.status;
			
			var output = "";
	
			output += "<b>" + response.display_name + "</b>";
			output += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
			output += "<button id=\"infoButton\">Update info</button>";
			output += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
			output += "<b>Game:</b> ";
			output += currentGame;
			output += "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
			output += "<b>Stream Title:</b> ";
			output += currentTitle;

			var output2 = "<span class='streamKoalaName'>StreamKoala</span>";

			$("#userinfo").html(output2 + "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" + output);
			
			$("#infoButton").button().click(updateTitlesOpen);
		}
	);
}

function ajaxFollowers() {
	$.getJSON(
		"https://api.twitch.tv/kraken/channels/" + username + "/follows?callback=?",
		{
			"client_id" : clientid,
			"api_version" : 3
		},
		function(response){
			followersStatus = response._total;
			updateFollowersAndViewers();
		}
	);
}




function updateFollowersAndViewers() {
	if (viewersStatus !== "" && followersStatus !== "") {
		$("#twitchChatViewers").html("<img src='viewers.png' width='10' height='10' /> " + viewersStatus + "&nbsp;&nbsp;&nbsp; <img src='followers.png' width='12' height='10' /> " + followersStatus);
		viewersStatus = "";
		followersStatus = "";
	}
}


function updateTitlesOpen() {
	$("#updateTitlesGame").val(currentGame);
	$("#updateTitlesTitle").val(currentTitle);
	updateDialog.dialog("open");
}

function updateTitlesSubmit() {
	var newGame = $("#updateTitlesGame").val();
	var newTitle = $("#updateTitlesTitle").val();
	updateDialog.dialog("close");
	if (newGame != currentGame || newTitle != currentTitle){
		$.get(
			"https://api.twitch.tv/kraken/channels/" + username,
			{
				"channel[game]": newGame,
				"channel[status]": newTitle,
				"_method": "put",
				"oauth_token": access_token	
			}
		);	
	}
}

function setAltTwitchVideo() {
	var newTwitchURL = $("#altTwitchVideoURL").val();
	$("#altTwitchVideo").attr("src", "http://www.twitch.tv/" + newTwitchURL + "/embed");
}
