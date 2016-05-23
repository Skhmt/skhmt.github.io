var clientid = 'mmkfyou3e4jgui4y57xxhag67apzdv9'; // public client id
var oauth = ''; // oauth without "oauth:", requires chat_login
var channels = [];
var index = 0;

$(function(){
  /* If there's no auth, send the user to the login page */
  if ( document.location.hash.length < 50 ) {
    window.location = 'https://api.twitch.tv/kraken/oauth2/authorize?response_type=token&' +
    'client_id=' + clientid +
    '&redirect_uri=https://skhmt.github.io/autohost/?scope=chat_login&force_verify=true';
  }
  else {
    oauth = document.location.hash.substring(14,44);
    history.pushState({}, "", "/getmods/"); // masking the url
    TAPIC.setup(clientid, oauth, function(username) {
      getFollowedChannels( username, 0 );
    } );
  }
});

function getFollowedChannels(username, offset) {
  $.getJSON('https://api.twitch.tv/kraken/users/' + username + '/follows/channels?callback=?',
    { "limit":100, "offset": offset, "sortby": 'last_broadcast' },
    function(res) {
      var folLen = res.follows.length;
      for (var i = 0; i < folLen; i++) {
        channels.push({
          channel: res.follows[i].channel.display_name,
          partner: res.follows[i].channel.partner,
          followTime: (new Date(res.follows[i].created_at)).getTime(),
          lastSeenTime: (new Date(res.follows[i].channel.updated_at)).getTime(),
          followers: res.follows[i].channel.followers,
          mod: false
        });
      }
      if ( folLen === 100 ) {
        return getFollowedChannels(username, (offset+100) );
      }
      else {
        outputChannels(username, offset+folLen);
      }
    } // anonymous function
  ); // getJSON
} // getFollowedChannels
