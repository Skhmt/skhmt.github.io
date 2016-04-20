var username = '';

$( function() {
	var clientid = '3s27p59atb0bwu6vkh2rnrxeqx3dn3h'; //streamkoala2 public client id
	var oauth = document.location.hash.substring(14,44);
	
	history.pushState({}, "", "/koala2/"); // masking the url

	TWAPI.setup( clientid, oauth, function(user) {
		username = user;
		$('#username').html( username );
		var channel = username;
		TWAPI.runChat( channel, function() {
			$('#twitchVideo').attr( 'src', 'http://player.twitch.tv/?autoplay=true&muted=true&channel=' + channel );
			$('#chatframe').attr( 'src', 'http://www.twitch.tv/' + channel + '/chat' );
			$('#username').html( TWAPI.getDisplayName() );
			refresh(5);
		} );
	} );

	// UI

	$('.updateStatusButton').click( function() {
		changeStatusOpen();
	} );

	$('#saveStatusButton').click( function() {
		changeStatusSubmit();
	} );
	
	$("#sortable").sortable({
		handle: ".handle"
	});
} );

function refresh( seconds ) {
	// online status
	if ( TWAPI.isOnline() ) {
		document.getElementById('username').className = 'text-success';
	}
	else {
		document.getElementById('username').className = 'text-danger';
	}

	$('#game').html( TWAPI.getGame().replace(/</g, '&lt;').replace(/\(/g, '&#40;') );
	$('#status').html( TWAPI.getStatus().replace(/</g, '&lt;').replace(/\(/g, '&#40;') );

	updateUserlist();
	updateViewers();

	if ( seconds ) {
		setTimeout( function() {
			refresh(seconds);
		}, seconds*1000 );
	}
}

function updateViewers() {
	$('#viewercount').html( `
		<i class="fa fa-user fa-fw text-info"></i>
		&nbsp;&nbsp;&nbsp;${TWAPI.getCurrentViewCount().toLocaleString()}
		<br>
		<i class="fa fa-heart fa-fw text-danger"></i>
		&nbsp;&nbsp;&nbsp;${TWAPI.getFollowerCount().toLocaleString()}`
	);
}

function updateUserlist() {
	var output = '';
	if ( !TWAPI.getChatters().staff ) return;

	if ( TWAPI.getChatters().staff.length > 0  ) {
		output += `<p> <b style="color: #C9F;">STAFF</b> &mdash;
			<b>${TWAPI.getChatters().staff.length.toLocaleString()}</b> <br> `;

		for (var i = 0; i < TWAPI.getChatters().staff.length; i++) {
			var tempuser = TWAPI.getChatters().staff[i];
			output += `${tempuser} <br> `;
		}
		output += '</p> ';
	}

	if ( TWAPI.getChatters().moderators.length > 0 ) {
		output += `<p> <b style="color: #34ae0a;">MODS</b> &mdash;
			<b>${TWAPI.getChatters().moderators.length.toLocaleString()}</b> <br> `;

		for (var i = 0; i < TWAPI.getChatters().moderators.length; i++) {
			var tempuser = TWAPI.getChatters().moderators[i];
			output += `${tempuser} <br> `;
		}
		output += '</p> ';
	}

	if ( TWAPI.getChatters().admins.length > 0 ) {
		output += `<p> <b style="color: #faaf19;">ADMINS</b> &mdash;
			<b>${TWAPI.getChatters().admins.length.toLocaleString()}</b> <br> `;

		for (var i = 0; i < TWAPI.getChatters().admins.length; i++) {
			var tempuser = TWAPI.getChatters().admins[i];
			output += `${tempuser} <br> `;
		}
		output += '</p> ';
	}

	if ( TWAPI.getChatters().global_mods.length > 0 ) {
		output += `<p> <b style="color: #1a7026;">GLOBAL MODS</b> &mdash;
			<b>${TWAPI.getChatters().global_mods.length.toLocaleString()}</b> <br> `;

		for (var i = 0; i < TWAPI.getChatters().global_mods.length; i++) {
			var tempuser = TWAPI.getChatters().global_mods[i];
			output += `${tempuser} <br> `;
		}
		output += '</p> ';
	}

	if ( TWAPI.getChatters().viewers.length > 0 ) {
		output += `<p> <b style="color: #3CF;">VIEWERS</b> &mdash;
			<b>${TWAPI.getChatters().viewers.length.toLocaleString()}</b> <br> `;

		for (var i = 0; i < TWAPI.getChatters().viewers.length; i++) {
			var tempuser = TWAPI.getChatters().viewers[i];
			output += `${tempuser} <br> `;
		}
		output += '</p> ';
	}

	$('#userlist').html(output);
}

function changeStatusSubmit() {
	var newGame = $('#updateGame').val();
	var newStatus = $('#updateStatus').val();
	$('#changeStatusModal').modal('hide');

	TWAPI.setStatusGame( newStatus, newGame );
	refresh();
}

function changeStatusOpen() {
	$('#changeStatusModal').modal('show');
	$('#updateGame').val( TWAPI.getGame() );
	$('#updateStatus').val( TWAPI.getStatus() );
}
