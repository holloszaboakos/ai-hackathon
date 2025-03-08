# Client-server architecture of the AI features

There are 3 active machines the architecture. A Client (the site visitor), Server and the OpenAI servers. We process client actions in 4 steps

 1. There is an event at Client, e.g. button press, input in the chat. It is sent to Server.
 2. The Server receives the event prompt. Creates promt for OpenAI API using the event, a description of the currently rendered page (by microsoft-omniparser) and a description of the pre-baked video assets
 3. Server streams back the sound and text data received from the API calls
 4. Sends it to the client in a single batch. The client displays the results.

Currently, the whole process takes around 5 seconds. Which can be reduced to <1 second, with a streaming connection between Server and Client.
