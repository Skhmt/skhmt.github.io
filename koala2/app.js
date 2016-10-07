var username = '';

$(function() {
    var clientid = '3s27p59atb0bwu6vkh2rnrxeqx3dn3h'; //streamkoala2 public client id
    var oauth = document.location.hash.substring(14, 44);
	console.log(oauth);

    history.pushState({}, "", "/koala2/"); // masking the url

    TAPIC.setup(clientid, oauth, function(user) {
        username = user;
        $('#username').html(username);
        var channel = username;
        TAPIC.joinChannel(channel);
	$('#twitchVideo').attr('src', 'http://player.twitch.tv/?channel=' + channel + '&muted=true');
	$('#chatframe').attr('src', 'http://www.twitch.tv/' + channel + '/chat');
	setTimeout(function () {
	  $('#username').html(TAPIC.getDisplayName());
	}, 5*1000);
	refresh(5);
    });

    // UI

    $('#updateStatusButton').click(function() {
        changeStatusSubmit();
    });

    $('#updateGameButton').click(function() {
        changeGameSubmit();
    });

    $("#sortable").sortable({
        handle: ".handle"
    });
});

function refresh(seconds) {
    // online status
    if (TAPIC.isOnline()) {
        document.getElementById('username').className = 'text-success';
    } else {
        document.getElementById('username').className = 'text-danger';
    }

    $('#game').html(TAPIC.getGame().replace(/</g, '&lt;').replace(/\(/g, '&#40;'));
    $('#status').html(TAPIC.getStatus().replace(/</g, '&lt;').replace(/\(/g, '&#40;'));

    updateUserlist();
    updateViewers();

    if (seconds) {
        setTimeout(function() {
            refresh(seconds);
        }, seconds * 1000);
    }
}

function updateViewers() {
    $('#viewercount').html(`
		<i class="fa fa-user fa-fw text-info"></i>
		&nbsp;&nbsp;&nbsp;${TAPIC.getCurrentViewCount().toLocaleString()}
		<br>
		<i class="fa fa-heart fa-fw text-danger"></i>
		&nbsp;&nbsp;&nbsp;${TAPIC.getFollowerCount().toLocaleString()}`);
}

function updateUserlist() {
    var output = '';
    if (!TAPIC.getChatters().staff) return;

    if (TAPIC.getChatters().staff.length > 0) {
        output += `<p> <b style="color: #C9F;">STAFF</b> &mdash;
			<b>${TAPIC.getChatters().staff.length.toLocaleString()}</b> <br> `;

        for (var i = 0; i < TAPIC.getChatters().staff.length; i++) {
            var tempuser = TAPIC.getChatters().staff[i];
            output += `${tempuser} <br> `;
        }
        output += '</p> ';
    }

    if (TAPIC.getChatters().moderators.length > 0) {
        output += `<p> <b style="color: #34ae0a;">MODS</b> &mdash;
			<b>${TAPIC.getChatters().moderators.length.toLocaleString()}</b> <br> `;

        for (var i = 0; i < TAPIC.getChatters().moderators.length; i++) {
            var tempuser = TAPIC.getChatters().moderators[i];
            output += `${tempuser} <br> `;
        }
        output += '</p> ';
    }

    if (TAPIC.getChatters().admins.length > 0) {
        output += `<p> <b style="color: #faaf19;">ADMINS</b> &mdash;
			<b>${TAPIC.getChatters().admins.length.toLocaleString()}</b> <br> `;

        for (var i = 0; i < TAPIC.getChatters().admins.length; i++) {
            var tempuser = TAPIC.getChatters().admins[i];
            output += `${tempuser} <br> `;
        }
        output += '</p> ';
    }

    if (TAPIC.getChatters().global_mods.length > 0) {
        output += `<p> <b style="color: #1a7026;">GLOBAL MODS</b> &mdash;
			<b>${TAPIC.getChatters().global_mods.length.toLocaleString()}</b> <br> `;

        for (var i = 0; i < TAPIC.getChatters().global_mods.length; i++) {
            var tempuser = TAPIC.getChatters().global_mods[i];
            output += `${tempuser} <br> `;
        }
        output += '</p> ';
    }

    if (TAPIC.getChatters().viewers.length > 0) {
        output += `<p> <b style="color: #3CF;">VIEWERS</b> &mdash;
			<b>${TAPIC.getChatters().viewers.length.toLocaleString()}</b> <br> `;

        for (var i = 0; i < TAPIC.getChatters().viewers.length; i++) {
            var tempuser = TAPIC.getChatters().viewers[i];
            output += `${tempuser} <br> `;
        }
        output += '</p> ';
    }

    $('#userlist').html(output);
}

function changeStatusSubmit() {
    var newStatus = $('#updateStatus').val();
    $('#changeStatusModal').modal('hide');

    TAPIC.setStatusGame(newStatus, TAPIC.getGame());
    refresh();
}

function changeGameSubmit() {
    var newGame = $('#updateGame').val();
    $('#changeGameModal').modal('hide');

    TAPIC.setStatusGame(TAPIC.getStatus(), newGame);
    refresh();
}

function changeStatusOpen() {
    $('#changeStatusModal').modal('show');
    $('#updateStatus').val(TAPIC.getStatus());
}

function changeGameOpen() {
    $('#changeGameModal').modal('show');
    $('#updateGame').val(TAPIC.getGame());
}
