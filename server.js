'use strict';



var channelStream;
var socket_server=io.connect();

var pc_server_to_client=new Object();    //each element of the array represents first node of a sin gle linked list
var index;  //stores index for a short amount of time till the connection is established 

var pcConfig = {
  'iceServers': [{
    'urls': 'stun:stun.l.google.com:19302'
  }]
};
////////////////////////////////////////
socket_server.emit('joined_server');
//////////////////////////////////////
//set up the messaging service
if (location.hostname !== 'localhost') {
  requestTurn(
    'https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913'
  );
}
function message_callback(message){
if(message.data=='startService'){
  temp_index=message.index;
	console.log("starting service and sending signal to client");
	socket_server.emit('message_next',{index:temp_index,data:"startService"});
	maybeStart();
}
 if (message.data.type === 'candidate' ) {
    var candidate = new RTCIceCandidate({
      sdpMLineIndex: message.data.label,
      candidate: message.data.candidate
    });
    pc_server_to_client.index.addIceCandidate(candidate);}
else if (message.data.type === 'answer') {
    pc_server_to_client.index.setRemoteDescription(new RTCSessionDescription(message.data));
  } 
}

socket_server.on('message',message_callback);
//////////////////////////////////////////
//getting user media and attaching it to video element 

	var video = document.querySelector('#video');
   navigator.mediaDevices.getUserMedia({
  audio: true,
  video: true
})
.then(gotStream)
.catch(function(e) {
  alert('getUserMedia() error: ' + e.name);
}); 


console.log("getting user media");
//////////////////////////
if (location.hostname !== 'localhost') {
  requestTurn(
    'https://computeengineondemand.appspot.com/turn?username=41784574&key=4080218913'
  );
}
/////////////////////////////
function gotStream(stream){
	console.log('attaching stream to video element');
	video.src= window.URL.createObjectURL(stream);
	channelStream=stream;
	
}


function maybeStart(){
	console.log("may be start called now creating peer connection");
	//peer connection
	if(pc_server_to_client.index) {pc_server_to_client.index.close();pc_server_to_client.index=null;console.log("Closing current connection and starting a new one");}
	try{
		pc_server_to_client.index=new RTCPeerConnection(pcConfig);
		pc_server_to_client.index.onicecandidate=handler_IceCandidate;  //no onaddstream handler

		console.log("created peer connection");
		pc_server_to_client.index.addStream(channelStream);
		//sending offer to client
		pc_server_to_client.index.createOffer(setLocalAndSendMessage, function(event){console.log("cannont create offer:"+event);});

	}
	catch(e){
		console.log('Failed to create PeerConnection, exception: ' + e.message);
    	alert('Cannot create RTCPeerConnection object.');
	}


}

function handler_IceCandidate(event){
	console.log('icecandidate event: ', event);													
	//sending info about network candidate to first client
  if (event.candidate) {
    socket_server.emit('message_next',{index:index,data:{
      type: 'candidate',
      label: event.candidate.sdpMLineIndex,
      id: event.candidate.sdpMid,
      candidate: event.candidate.candidate
    }});
  } else {
    console.log('End of candidates.');
  }
}

function setLocalAndSendMessage(sessionDescription){
  pc_server_to_client.index.setLocalDescription(sessionDescription);
  console.log('setLocalAndSendMessage sending message', sessionDescription);
  socket.emit('message_next',{index:index,data:sessionDescription}); 								

}

///////////////////////////////////////////////////////////////////////////////////















