import { resolve } from 'path'
import sha1 from 'sha1';
import { createHttpTerminator } from 'http-terminator';
import killport from 'kill-port';
import express from 'express';
import http from 'http';
import { Server } from "socket.io";
import { createServer} from 'http';
import WebSocket from 'ws'
import jimp from 'jimp'
import fs from 'fs'
import * as generateImage from './generateImage.js'
import * as galleryImages from './galleryImages.js'

function requestModelChange(model){
	let template = {}
	return template
}

function systemConfig(t, socket){
	let template = {}
	return template
}

function sid(t, socket){
	let template = {}
	return template
}

function error(t, socket){
	let template = {}
	return template
}

function message(t, socket){
	let template = {}
	return template
}

function requestImages(t, socket){
	let template = {}
	return template
}

function requestModelChange(model){
	let output = {
		"model_name": model,
		"model_list":{
			"stable-diffusion-1.5": {
				"status": "active",
				"description": "The newest Stable Diffusion version 1.5 weight file (4.27 GB)",
				"weights": "models/ldm/stable-diffusion-v1/v1-5-pruned-emaonly.ckpt",
				"config": "configs/stable-diffusion/v1-inference.yaml",
				"width": 512,
				"height": 512,
				"vae": "./models/ldm/stable-diffusion-v1/vae-ft-mse-840000-ema-pruned.ckpt",
				"default": true
			},
			"stable-diffusion-1.4": {
				"status": "not loaded",
				"description": "Stable Diffusion inference model version 1.4",
				"weights": "models/ldm/stable-diffusion-v1/sd-v1-4.ckpt",
				"config": "configs/stable-diffusion/v1-inference.yaml",
				"width": 512,
				"height": 512,
				"vae": "models/ldm/stable-diffusion-v1/vae-ft-mse-840000-ema-pruned.ckpt",
				"default": false
			},
			"inpainting-1.5": {
				"status": "not loaded",
				"description": "RunwayML SD 1.5 model optimized for inpainting",
				"weights": "models/ldm/stable-diffusion-v1/sd-v1-5-inpainting.ckpt",
				"config": "configs/stable-diffusion/v1-inpainting-inference.yaml",
				"width": 512,
				"height": 512,
				"vae": "models/ldm/stable-diffusion-v1/vae-ft-mse-840000-ema-pruned.ckpt",
				"default": false
			}
		} 
	}
	return output
}


function startServer(port){
	//check if port within range 0-65535
	if (port < 0 || port > 65535 || isNaN(port)){
		port = 9090
	}
	
	const app = express();
	const server = createServer(app);
	var socketio = new Server(server);

	app.get('/', function (req, res) {
		res.send()
	});

	app.get('/outputs', (req, res) => {

	});

	app.get('/socket.io', (req, res) => {
		//res.send('Hello World!');
		if (req.query.EIO == 4 && req.query.transport == 'polling' && req.query.t != null && req.query.sid == null){
			// create session ID
			let sid = sha1(req.query.t).substring(0,20)
			//set cookies for session ID
			res.cookie('sid', sid)
			let response = [{"sid":sid,"upgrades":["websocket"],"pingTimeout":60000,"pingInterval":100000}]
			res.send(response)
		}
		else if (req.query.EIO == 4 && req.query.transport == 'polling' && req.query.t != null && req.query.sid != null){
			let response = "OK"
			res.send(response)		
		}
		else if (req.query.EIO == 4 && req.query.transport == 'websocket' && req.query.sid != null){
			//startWebsocket(true)
		}		
		// shut down the express server
	});

	app.get('/upload', (req, res) => {

	});

	app.get('/flaskwebgui-keep-server-alive', (req, res) => {
		res.send()
	});

	server.listen(process.env.PORT || port, function() {
	var host = server.address().address
	var port = server.address().port
	console.log('App listening at http://%s:%s', host, port)
	});

	socketio.on('connection', function(socket) {
		console.log('Client connected to the WebSocket');

		socket.on('disconnect', () => {
			console.log('Client disconnected');
		});

		let results = undefined

		socket.on('generateImage', function(request) {
			console.log("Received a generateImage request");
			results = generateImage(request, socket)
		});

		socket.on('requestImages', function(user) {
			console.log("Received a requestImages request");
			let output = requestImages(user, socket)
			socket.emit('requestImages', output);
		});

		socket.on('requestModelChange', function(user) {
			console.log("Received a requestModelChange request");
			let	output = requestModelChange(user, socket)
			socket.emit('requestModelChange', output);
		});

		socket.on('sid', function(user) {
			console.log("Received a sid request");
			let	output = sid(t, socket)
			socket.emit('sid', output);
		});

		socket.on('systemConfig', function(user) {
			console.log("Received a systemConfig request");
			let	output = systemConfig(t, socket)
			socket.emit('systemConfig', output);
		});

		socket.on('error',  function(user) {
			console.log("Received a error request");
			let	output = error(t, socket)
			socket.emit('error', output);
		});

		socket.on('message', function(message){
			console.log("Received a message request");
			let	output = message(t, socket)
			socket.emit('message', output);
		})
	})
}
startServer();