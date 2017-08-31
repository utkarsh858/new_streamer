'use strict';

var os = require('os');
var nodeStatic= require('node-static'); 
var http=require('http');
var socketIO = require('socket.io');

var fileServer = new (nodeStatic.Server)();
var app=http.createServer(function(req,res){fileServer.serve(req,res);}).listen(8080);

var io=socketIO.listen(app);

var Queue = function() {
	this.first = null;
	this.size = 0;
};

var Nope = function(data) {
	this.data = data;
	this.next = null;
};

Queue.prototype.enqueue = function(data) {
	var node = new Nope(data);
	var n;
	if (!this.first){
		this.first = node;
	} else {
		n = this.first;
		while (n.next) {
			n = n.next;
		}
		n.next = node;
	}

	this.size += 1;
	return node;
};

Queue.prototype.dequeue = function() {
	var temp = this.first;
	this.first = this.first.next;
	this.size -= 1;
	return temp;
};


/*
var i;

var key_prevSock;var key_nextSock;
*/
function Tree (data) {
	var node =  new Node (data);
	this._root = node;
}

function Node (data) {
	this.data = data;
	this.parent = null;
	this.children = [];
}


//                          Seriously if you were not going to use it ,why declare it then!!?


Tree.prototype.add = function(data, toData, traversal) {
	var child = new Node(data);var  parent = null; 
	var callback = function(node) {
		if (node.data === toData) {
			parent = node;
		}
	};

	this.contains(callback, traversal);

	if (parent) {
		parent.children.push(child);
		child.parent = parent;
	} else {
		throw new Error('Cannot add node to a non-existent parent.');
	} 
};

Tree.prototype.traverseBF = function(callback) {
		console.log("traverseBF called");
	var Is_new_child_added=false;
	var queue = new Queue();
	
	queue.enqueue(this._root);
	console.log("starting queue");
	console.log(queue);
	var currentTree = queue.dequeue();

	while(currentTree){
		console.log("////////////////////////////");
		console.log(currentTree);
		console.log("/////////////////////////");
		console.log("Queue:");
		console.log(queue);
		console.log("////////////////////////");

		
		for (var i = 0, length = currentTree.data.children.length; i < length; i++) {
			console.log("looping");

			//com'on vedansh we have to enqueue a new node ,not just a string!!
			var temp_child=new Node (currentTree.data.children[i]);
			temp_child.parent=currentTree.data.data;
			temp_child.children=[];
			queue.enqueue(temp_child);
		}    

		Is_new_child_added=callback(currentTree);console.log("BFS breaks");
		if(queue.first) currentTree = queue.dequeue();
		if(Is_new_child_added) break;
	}
};



var peer_tree;
//var peer_tree = new Tree();

var connected_callback=function(socket){

/*
var callback_node_add=function(){
if(currentTree.data.children.length<max_peer_connections){
  currentTree.data.children.push(socket);
  
}
*/
var max_peer_connections=3;

var callback_node_add=function(currentTree){
	console.log("node_add callled");
	if(currentTree.data.children.length<max_peer_connections){
		currentTree.data.children.push(socket.id);
		io.to(currentTree.data.data).emit('message',{data:"startService",index:socket.id});
		console.log("sent message to socket:  ");console.log(currentTree.data.data);
		return true;
	}				

	return false;			//we need to let the transverseBF break only when no child is added!!
}


Tree.prototype.parentMessage = function(message) {
	var queue = new Queue();

	queue.enqueue(this._root);

	var currentTree = queue.dequeue();

	while(currentTree){
		console.log("parentMessage called")
		for (var i = 0, length = currentTree.data.children.length; i < length; i++) {
			queue.enqueue(currentTree.data.children[i]);
			if(currentTree.data.children[i]==socket.id){
				io.to(currentTree.data).emit('message',{index:socket.id,data:message});return;
			}
		}

                    //callback(currentTree);
                    currentTree = queue.dequeue();
                }
            };






/*
var temp=socket.id;																	//work here rooms!!!!!
if(io.sockets.adapter.rooms['room']!=undefined){
var conSockId=Object.keys(io.sockets.adapter.rooms['room'].sockets);
	var index_of_socket =conSockId.indexOf(temp+"");

}
var rooms_of_a_socket=io.sockets.adapter.sids[socket.id+""];
*/
////////////////////




////////////




var message_next_callback=function(message){
	/*
	var temp_room=message.room;

	if(io.sockets.adapter.rooms[temp_room]!=undefined){
	conSockId=Object.keys(io.sockets.adapter.rooms[temp_room].sockets);  
	index_of_socket=conSockId.indexOf(temp+"");

	key_nextSock=conSockId[index_of_socket+1];

	io.to(key_nextSock).emit('message_next',message.data);       //in message_next no need to send the room no.
	console.log("sent the message to next socket"+key_nextSock+"of"+socket.id+"in room"+temp_room);
}*/

io.to(message.index).emit('message_next',message.data);
}

var message_callback=function(message){
	/*
	var temp_room=message.room;
 if(io.sockets.adapter.rooms[temp_room]!=undefined){
	 conSockId=Object.keys(io.sockets.adapter.rooms[temp_room].sockets);
	 index_of_socket=conSockId.indexOf(temp+"");
	 
	key_prevSock=conSockId[index_of_socket-1];
	
	io.to(key_prevSock).emit('message',message);    //send room also (done because of server)
	console.log("sent the message to previous socket "+key_prevSock+"of"+socket.id+"in room:"+temp_room);
}*/

peer_tree.parentMessage(message);
}

var joined_callback=function(){
	console.log("joined_callback called");
	/*var temp_room;
	var loop=true;
	for(var iterator=1;iterator<=roomCount&&loop;iterator++)
	if(Object.keys(io.sockets.adapter.rooms[iterator+""].sockets).length<maxSize)
	{socket.join(iterator+"");
	temp_room=iterator+"";
	socket.emit("room",iterator+"");
	console.log(iterator);
	loop=false;                             //edited
	}

	if(io.sockets.adapter.rooms[temp_room]!=undefined){
	console.log(io.sockets.adapter.rooms[temp_room]);
	console.log(io.sockets.adapter.sids[temp+""]);
	 conSockId=Object.keys(io.sockets.adapter.rooms[temp_room].sockets);
	 index_of_socket=conSockId.indexOf(temp+"");
	
	key_prevSock=conSockId[index_of_socket-1];
	
	io.to(key_prevSock).emit('message',{room:temp_room,data:"startService"});
	console.log("received joined request of "+socket.id+"in room:"+temp_room);
}}*/

peer_tree.traverseBF(callback_node_add);



}

var joined_again_callback =function(room){
	console.log("joined_again");
	/*
	if(io.sockets.adapter.rooms[room]!=undefined){
	console.log(io.sockets.adapter.rooms[room]);
	
	 conSockId=Object.keys(io.sockets.adapter.rooms[room].sockets);
	 index_of_socket=conSockId.indexOf(temp+"");
	
	key_prevSock=conSockId[index_of_socket-1];
	
	io.to(key_prevSock).emit('message',{room:room,data:"startService"});
	console.log("received joined request of "+socket.id+"in room:"+room);
	}
	*/
}

var disconnect_callback = function(){
	console.log("disconnecteds")
	/*
	var isMobile=array_of_mobiles.indexOf(temp);   
	if(isMobile==-1)

	{// if disconnected socket is not mobile
		//lets find out which room was it in
		console.log("A socket is disconnected"+socket.id);
		console.log(rooms_of_a_socket);
		if(rooms_of_a_socket){
		var temp_room=Object.keys(rooms_of_a_socket)[0];
		console.log(temp_room);
			}

	if(io.sockets.adapter.rooms[temp_room]!=undefined){
	conSockId=Object.keys(io.sockets.adapter.rooms[temp_room].sockets);
	 key_prevSock=conSockId[index_of_socket-1];
	 conSockId=conSockId=Object.keys(io.sockets.adapter.rooms[temp_room].sockets);
	
	console.log(" previous socket:       "+key_prevSock+"of room:"+temp_room);
	console.log(" disconnected socket :    "+socket.id+"of room"+temp_room);
	
	console.log("sent it to"+ key_prevSock);
	io.to(key_prevSock).emit('message',{room:temp_room,data:'startService'});
	
	
	}
	
	}


	else{    //if disconnected one is a mobile
		 delete array_of_mobiles[isMobile];
		io.to(array_of_mobiles[0]).emit("disconnect_mobile",isMobile);

	}*/

}



/*
var message_server_callback=function(message){
	io.to(array_of_mobiles[0]).emit("message_server",message);
}*/

function joined_server_callback(){
/*	for(var iterator=1;iterator<=roomCount;iterator++)
	{
		console.log("joined the server to room:"+iterator);
		socket.join(iterator+"");   //server will be the first element in all rooms

	}*/
	peer_tree=new Tree(socket.id);
	console.log("created tree::");
	

}

socket.on('message',message_callback);
socket.on('message_next',message_next_callback);
socket.on('joined',joined_callback);
socket.on('joined_again',joined_again_callback);
socket.on('disconnect',disconnect_callback);

socket.on('joined_server',joined_server_callback);
}


io.sockets.on('connection',connected_callback);




