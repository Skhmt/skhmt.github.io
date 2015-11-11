<?php

// create a new cURL resource
$ch = curl_init();

// Disable SSL verification
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

// Will return the response, if false it print the response
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

// set URL and other appropriate options
// http://tmi.twitch.tv/hosts?include_logins=1&target={id110}
curl_setopt($ch, CURLOPT_URL, "http://tmi.twitch.tv/hosts?include_logins=1&target=70034299");
curl_setopt($ch, CURLOPT_HEADER, 0);

// grab URL and put it into $json
$json = json_decode(curl_exec($ch), true);

// close cURL resource, and free up system resources
curl_close($ch);

var_dump($json);
?>
