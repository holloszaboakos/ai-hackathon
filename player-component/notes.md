# Player component

Actions:
 - "prompt": user enters a prompt
    - payload: text
 - "reaction": server responds with reaction
    - payload: {image: Option<Image>, sound: Option<Sound>, video: Option<Video>, text: Option<Text>}. Sound and video are streamed. Later there should be a default video for the actor, we should handle transitions smoothly
Reducers:
 - send-prompt: to "prompt" events, sends it to server
 - display-reaction: reacts to "reaction" events, displays it. 


