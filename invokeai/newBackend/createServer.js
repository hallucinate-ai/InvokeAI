import { resolve } from 'path'
import sha1 from 'sha1';
import express from 'express';
import http from 'http';
import { Server } from "socket.io";
import { createServer} from 'http';
import jimp from 'jimp'
import fs from 'fs'
import * as generateImage from './generateImage.js'
import * as galleryImages from './galleryImages.js'
import * as enhanceImage from './enhanceImage.js'
import * as getModelList from './getModelList.js'
import { exec } from 'child_process';
import axios from 'axios'
import * as child_process from "child_process";
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import multipart from 'connect-multiparty';
import Jimp from 'jimp';
import os from 'os';
import path from 'path'

async function execute(command, args) {
    return new Promise((resolve, reject) => {
        const spawn = child_process.spawn(command, args)
        let result = ""
        spawn.stdout.on('data', (data) => {
            if (result) {
                //reject(Error('Helper function does not work for long lived proccess'))
            }
            result = data.toString()
        })
        spawn.stderr.on('data', (error) => {
            reject(Error(error.toString()))
        })
        spawn.on('exit', code => {
            resolve({ code, result })
        })
    })
}


function systemConfig(t, socket){
	let template ={
		"model": "stable diffusion",
		"model_weights": "stable-diffusion-1.5",
		"model_hash": "cc6cb27103417325ff94f52b7a5d2dde45a7515b25c255d8e396c90014281516",
		"app_id": "invoke-ai/InvokeAI",
		"app_version": "2.2.5",
		"model_list": {
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
		},
		"infill_methods": [
			"tile"
		]
	}
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

function requestImages(type, sid, socket){
	let template = {
		"images": [
		  {
			"url": "outputs/000010.2bcb884f.947026880.png",
			"thumbnail": "outputs/thumbnails/000010.2bcb884f.947026880.webp",
			"mtime": 1676033828.7068207,
			"metadata": {
			  "model": "stable diffusion",
			  "model_weights": "stable-diffusion-1.5",
			  "model_hash": "cc6cb27103417325ff94f52b7a5d2dde45a7515b25c255d8e396c90014281516",
			  "app_id": "invoke-ai/InvokeAI",
			  "app_version": "2.2.5",
			  "image": {
				"prompt": [
				  {
					"prompt": "test",
					"weight": 1
				  }
				],
				"steps": 50,
				"cfg_scale": 7.5,
				"threshold": 0,
				"perlin": 0,
				"height": 512,
				"width": 512,
				"seed": 947026880,
				"seamless": false,
				"hires_fix": false,
				"type": "txt2img",
				"postprocessing": null,
				"sampler": "k_lms",
				"variations": []
			  }
			},
			"dreamPrompt": "\"test\" -s 50 -S 947026880 -W 512 -H 512 -C 7.5 -A k_lms",
			"width": 512,
			"height": 512,
			"category": "result"
		  }
		],
		"areMoreImagesAvailable": false,
		"category": "result"
	  }
	let response = {}
	if (type == "user"){
		response = galleryImages.main("user", undefined, socket)
	}
	else{
		response = galleryImages.main("result", undefined, socket)
	}

	console.log(response)
	console.log(template)
	return response
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


export function startServer(port){
	let cwd = process.cwd()
	//check if port within range 0-65535
	if (port < 0 || port > 65535 || isNaN(port)){
		port = 9090
	}
	
	const app = express();
	const server = createServer(app);
	var socketio = new Server(server);
	var multipartMiddleware = multipart();

	app.use(express.json());
	app.use(express.urlencoded());
	app.use(multipartMiddleware);
	//app.use(bodyParser.urlencoded({ extended: true }));
	//app.use(bodyParser.json())
	if (!fs.existsSync('./gallery')){
		fs.mkdirSync('./gallery')
	}
	if (!fs.existsSync('./s3gallery')){
		fs.mkdirSync('./s3gallery')
	}
	let command = "mount | grep s3gallery"
	let permission = false
	let results = ""
	//run the async function execute with the command, and wait for the results to come back before continuing
	const response = ( async () => {
		results = await exec(command, (error, stdout, stderr) => {
			if (error) {
				console.log(`error: ${error.message}`);
				let ACCESS_KEY_ID = "OVEXCZJJQPUGXZOV"
				let SECRET_ACCESS_KEY = "H1osbJRy3903PTMqyOAGD6MIohi4wLXGscnvMEduh10"
				let command = "echo " + ACCESS_KEY_ID + ":" + SECRET_ACCESS_KEY + " > .passwd-s3fs ; chmod 600 .passwd-s3fs"
				results = execute("echo", [ACCESS_KEY_ID + ":" + SECRET_ACCESS_KEY + " > .passwd-s3fs ; chmod 600 .passwd-s3fs"])
				console.log(command)
				console.log(results)
				command = "s3fs gallery s3gallery -o passwd_file=./.passwd-s3fs -o url=https://object.ord1.coreweave.com -o use_path_request_style"
				results = execute("s3fs", ["s3gallery", "s3gallery", "-o", "passwd_file=.passwd-s3fs", "-o", "url=https://object.ord1.coreweave.com", "-o", "use_path_request_style"])
				console.log(command)
				console.log(results)
			}
			if (stderr) {
				console.log(`stderr: ${stderr}`);
				return;
			}
			console.log(`stdout: ${stdout}`);
			return stdout
		});

	})();


	app.get('/', function (req, res) {
		res.send()
	});

	// catch wildcards for /outputs/*
	app.get('/outputs/*', (req, res) => {
		console.log("requesting an image")
		console.log(req.query)
		console.log(req.path)
		console.log(req.url)
		let path = req.path
		path = path.replace("/outputs/", "./gallery/")
		//open the image
		if (fs.existsSync(path) != false){
			let image = fs.readFileSync(path)
			res.send(image)
		}
		else{
			res.send()
		}
	});	

	let sid = ""
	app.get('/socket.io', (req, res) => {
		//res.send('Hello World!');
		if (req.query.EIO == 4 && req.query.transport == 'polling' && req.query.t != null && req.query.sid == null){
			// create session ID
			sid = sha1(req.query.t).substring(0,20)
			//set cookies for session ID
			res.cookie('sid', sid)
			let response = [{"sid":sid,"upgrades":["websocket"],"pingTimeout":60000,"pingInterval":100000}]
			if (!fs.existsSync('./gallery/' + sid)){
				fs.mkdirSync('./gallery' + sid)
			}
			if (!fs.existsSync('./s3gallery' + sid)){
				fs.mkdirSync('./s3gallery' + sid)
			}
			command = "s3cmd sync s3://gallery/" + sid + " ./gallery/" + sid;
			results = execute("s3cmd", ["sync", "s3://gallery/" + sid, "./gallery/" + sid])
			res.send(response)
		}
		else if (req.query.EIO == 4 && req.query.transport == 'polling' && req.query.t != null && req.query.sid != null){
			// if directory exists, delete it
			let response = "OK"
			res.send(response)		
		}
		else if (req.query.EIO == 4 && req.query.transport == 'websocket' && req.query.sid != null){
			//startWebsocket(true)
		}		
		// shut down the express server
	});

	app.post('/upload*', multipartMiddleware, (req, res) => {
		let cwd = process.cwd()
		let dir = cwd 
		let sid = "defaultUser"
		// get form data
		let formData = req.query
		let body = req.body
		let data = body["data"]
		let files = req.files
		let file = {}
		if("file" in files){
			file = files["file"]
		}
		let fileName = file["name"]
		let tmpPath = file["path"]
		let type = file["type"]
		// remove the .png extension from the file name
		fileName = fileName.replace(".png", "")
		let dstPath = dir + "/gallery/" + sid + "/" + fileName + "-uploaded" + ".png"
		// copy the file from the temporary location to the intended location
		fs.copyFileSync(tmpPath, dstPath)
		fs.rmSync(tmpPath)
		// create a thumbnail with jimp of the uploaded image
		let thumbnail = "./gallery/" + sid + "/" + fileName + "-uploaded" + "-thumbnail" + ".png"
		let imgData = Jimp.read(dstPath)
		//resize the image to a maximum width of 200px and a maximum height of 200px
		imgData.then(function (image) {
			image.resize(256, 256)
			image.write(thumbnail)
		})
		// upload the image to s3
		command = "s3cmd --config=cw-object-storage-config_stable-diffusion put " + dstPath + " s3://gallery/" + sid + "/" + fileName + "-uploaded" + ".png"
		results = execute("s3cmd", ["--config=cw-object-storage-config_stable-diffusion", "put", dstPath, "s3://gallery/" + sid + "/" + fileName + "-uploaded" + ".png"])
		let output = {
			"height":imgData.height,
			"mtime":fs.statSync(dstPath).mtimeMs,
			"thumbnail":"outputs/defaultUser/" + fileName +  "-uploaded-thumbnail.png",
			"url":"outputs/defaultUser/" + fileName+ "-uploaded.png",
			"width":imgData.width
		}
		res.send(output)
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
		if (sid == ""){
			let timestamp = new Date().getTime()
			sid = sha1(timestamp).substring(0,20)
		}
		socket.emit('sid', sid)
		let config = systemConfig()
		socket.emit('systemConfig', config)
		let images = requestImages("result", sid, socket)
		socket.emit('galleryImages', images)
		

		socket.on('disconnect', () => {
			console.log('Client disconnected');
		});

		let results = undefined
		let results2 = undefined
		socket.on('generateImage', function(request, request2, request3, ) {
			console.log("Received a generateImage request");
			let timestamp = Date.now()
			const response = ( async () => {
				results = await generateImage.main(request, request2, request3, timestamp, socket)
			})();
		});

		socket.on('requestImages', function(type, value) {
			if (type == "result"){
				console.log("Received a requestImages request");
				let output = galleryImages.main(type, value, socket)
				socket.emit('requestImages', results);
			}
			if (type == "user"){
				console.log("Received a requestImages request");
				let output = galleryImages.main(type, value, socket)
				socket.emit('galleryImages', output);
			}
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
//startServer();