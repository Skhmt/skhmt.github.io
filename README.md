# skhmt.github.io / StreamKoala

This program can be used and modified freely. I just ask that I'm given credit and sent a link to your completed work so I can take a look at it :D

## How to run StreamKoala off of another site.

If you don't understand javascript, you might want to learn some of the basics before doing this...

Download everything.

Go here: https://secure.twitch.tv/settings/connections.

On the bottom, click "Register your application".

On the next page, name your application something and set the Redirect URI to [url]/koala/ .

Once that's done, on the connections page you should see your app at the bottom. Click "edit" and take note of your Client ID. You do NOT need a Client Secret and it will not be used for this.

In /koala/scripts.js remove StreamKoala's Client ID and add yours in line 2 within the quotation marks. 

In /koala/scripts.js on line 18, choose a new URL to send users to, either your front page or the Twitch Authorize URI or just remove lines 16-19 if you don't care.

You'll also need to edit the front page index.html to link to your app's specific Twitch Authorize URI thing.

By the way, the Twitch Authorize URI thing will be:

https://api.twitch.tv/kraken/oauth2/authorize?response_type=token&client_id=[YOUR_CLIENT_ID]&redirect_uri=[YOUR_REDIRECT_URI]&scope=channel_editor&force_verify=true

That's it.

## How does StreamKoala work?

/koala/scripts.js does basically everything. It accesses the Twitch API via JSONP and plays videos and the chat window with a simple iframe. It's actually really really simple.
