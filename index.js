'use strict';

var os = require('os');
var nodeStatic= require('node-static'); 
var http=require('http');
var socketIO = require('socket.io');

var fileServer = new (nodeStatic.Server)();
var app=http.createServer(function(req,res){fileServer.serve(req,res);}).listen(8080);

var io=socketIO.listen(app);


var tree=[];
var server_client_lines=3,client_client_lines=3;

var connected_callback=function(socket){





var message_next_callback=function(message){


	io.to(message.index).emit('message_next',message.data);
	
}

var message_callback=function(message){

	
	var index_child=tree.indexOf(socket.id);
	var index_parent=Math.floor((index_child-1)/server_client_lines);
	io.to(tree[index_parent]).emit('message',{index:socket.id,data:message});
}

var joined_callback=function(){
	console.log("Pushing a client");
	
	tree.push(socket.id);
	
	var index_child=tree.indexOf(socket.id);
	var index_parent=Math.floor((index_child-1)/server_client_lines);
	console.log("A faccha got added with id:"+index_child+":"+tree[index_child]+"   parent:"+ index_parent+":"+tree[index_parent]);
	io.to(tree[index_parent]).emit('message',{data:"startService",index:socket.id});
}

var joined_again_callback =function(room){
	console.log("joined_again");
}

var disconnect_callback = function(){
	console.log("disconnecteds")
}

function joined_server_callback(){
	
	
	tree[0]=socket.id;
	console.log("created tree"+tree[0]);
}

socket.on('message',message_callback);
socket.on('message_next',message_next_callback);
socket.on('joined',joined_callback);
socket.on('joined_again',joined_again_callback);
socket.on('disconnect',disconnect_callback);

socket.on('joined_server',joined_server_callback);
}


io.sockets.on('connection',connected_callback);

