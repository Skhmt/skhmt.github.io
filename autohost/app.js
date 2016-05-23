
// https://www.reddit.com/r/Twitch/comments/4kd39i/looking_for_autohost_bot_for_linux/

// https://github.com/justintv/Twitch-API/blob/master/v3_resources/streams.md#get-streams
// https://api.twitch.tv/kraken/streams/?limit=100&offset=0&channel=food,bobross,monstercat,skhmt
//   .streams[i].game/viewers/preview.large/channel.status/channel.display_name/channel.logo/channel.video_banner/

var clientid = 'mmkfyou3e4jgui4y57xxhag67apzdv9'; // public client id
var oauth = ''; // oauth without "oauth:", requires chat_login
var channels = [];

$(function(){


  login(clientid);
});

function login(client) {
  // If there's no auth, send the user to the login page
  if ( document.location.hash.length < 50 ) {
    window.location = 'https://api.twitch.tv/kraken/oauth2/authorize' +
    '?response_type=token' +
    '&client_id=' + client +
    '&scope=chat_login' +
    '&force_verify=true' +
    '&redirect_uri=https://skhmt.github.io/autohost/';
  }
  else {
    oauth = document.location.hash.substring(14,44);
    history.pushState({}, '', '/autohost/'); // masking the url
    TAPIC.setup(client, oauth, function(username) {
      getFollowedChannels( username, 0 );
    } );
  }
}

function getFollowedChannels(username, offset) {
  $.getJSON(`https://api.twitch.tv/kraken/users/${username}/follows/channels?callback=?`,
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
        // outputChannels(username, offset+folLen);
      }
    } // anonymous function
  ); // getJSON
} // getFollowedChannels
