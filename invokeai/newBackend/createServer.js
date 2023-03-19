import { resolve } from 'path';
import sha1 from 'sha1';
import express from 'express';
import http from 'http';
import { Server } from "socket.io";
import { createServer} from 'http';
import jimp from 'jimp';
import fs from 'fs';
import * as generateImage from './generateImage.js';
import * as galleryImages from './galleryImages.js';
import { exec } from 'child_process';
import axios from 'axios';
import * as child_process from "child_process";
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import multipart from 'connect-multiparty';
import Jimp from 'jimp';
import os from 'os';
import path from 'path';
import { XMLHttpRequest } from 'xmlhttprequest'

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

function systemConfig(t, model, token, socket){
		let models = child_process.execSync('node getModelList.js', { stdio: 'ignore' })
		models = fs.readFileSync("modelDict.json")
		models = JSON.parse(models)
		let modelDict = {}
		let modelNameDict = {}
		let thisModels = models[3]
		for( var model in thisModels){
			let modelName = model
			let thisModel = thisModels[model]
			for (var modelVersion in thisModel){
				let modelVersionName = modelVersion
				let civitai = thisModel[modelVersion]
				modelNameDict[civitai] = modelName + " " + modelVersionName 
			}	
		}
	 	thisModels = models[0]

		for (var model in thisModels){
			let modelName = model
			let width = thisModels[model]["baseResolution"][0]
			let height = thisModels[model]["baseResolution"][0]
			let thumbnail = thisModels[model]["thumbnail"]
			let modelid = thisModels[model]["defaultCheckpoint"]
			let website = thisModels[model]["website"]
			let rating = thisModels[model]["rating"]
			let ratingcount = thisModels[model]["ratingcount"]
			modelDict[modelNameDict[modelName]] = {
				"status": "inactive",
				"modelid": modelid,
				"rating": rating,
				"website": website,
				"thumbnail": thumbnail,
				"description": modelName,
				"rating": rating,
				"ratingcount": ratingcount,
				"config": "configs/stable-diffusion/v1-inference.yaml",
				"width": width,
				"height": height,
				"default": false
			}
		}

		modelDict["stable-diffusion-v1.5"] = {
				"status": "active",
				"description": "Stable Diffusion version 1.5",
				"modelid": "stable-diffusion-v1.5",
				"website": "https://stability.ai/",
				"thumbnail": "https://images.squarespace-cdn.com/content/v1/6213c340453c3f502425776e/1677792559545-55FBL2X2SFVHMKFGFYO1/2777127019_abstract_shapes__colorways__patterns_and_shapes__Partnership_Stability_and_Krikey_team_together__bes.png?format=750w",
				//"weights": "models/ldm/stable-diffusion-v1/v1-5-pruned-emaonly.ckpt",
				"config": "configs/stable-diffusion/v1-inference.yaml",
				"width": 512,
				"rating": 5,
				"ratingcount": 20,
				"height": 512,
				"default": true
		}
		modelDict["stable-diffusion-v2.1"] = {
			"status": "inactive",
			"description": "Stable Diffusion version 1.5",
			"modelid": "stable-diffusion-v1.5",
			"website": "https://stability.ai/",
			"thumbnail": "https://images.squarespace-cdn.com/content/v1/6213c340453c3f502425776e/1677792559545-55FBL2X2SFVHMKFGFYO1/2777127019_abstract_shapes__colorways__patterns_and_shapes__Partnership_Stability_and_Krikey_team_together__bes.png?format=750w",
			//"weights": "models/ldm/stable-diffusion-v1/v1-5-pruned-emaonly.ckpt",
			"config": "configs/stable-diffusion/v1-inference.yaml",
			"width": 512,
			"rating": 5,
			"ratingcount": 20,
			"height": 512,
			"default": true
		}
		// sort modelDict by key active first
		let activeModels = {}
		let inactiveModels = {}
		for (var model in modelDict){
			if (modelDict[model]['ratingcount'] >= 10){
				if (modelDict[model]["status"] == "active"){
					activeModels[model] = modelDict[model]
				}
				else{
					inactiveModels[model] = modelDict[model]
				}
			}
		}
		modelDict = {...activeModels, ...inactiveModels}
		fs.writeFileSync("filterdmodelDict.json", JSON.stringify(modelDict))
		let template ={
		"model": "stable diffusion",
		"model_weights": "stable-diffusion-1.5",
		"model_hash": "cc6cb27103417325ff94f52b7a5d2dde45a7515b25c255d8e396c90014281516",
		"app_id": "invoke-ai/InvokeAI",
		"app_version": "2.2.5",
		"model_list": modelDict,
		"infill_methods": ["tile"]
		}
		if(token != null && token != undefined && token != ""){
			template["token"] = token
		}
		let serverStatus = getServerStatus()
		let workers = serverStatus["workers"]
		for( var worker in workers){
			let thisWorker = workers[worker]
			let thisModel = thisWorker["model"]
			if (Object.keys(template["model_list"]).includes(thisModel)){
				template["model_list"][thisModel]["status"] = "active"
			}
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

function requestImages(type, sid, mtime, token, socket){
	let response = {}
	if (type == "user"){
		response = galleryImages.main("user", mtime, token, socket)
	}
	else{
		response = galleryImages.main("result", mtime, token, socket)
	}

	console.log(response)
	return response
}


function getServerStatus(){
    let serverStatus = {}
    let url = "https://api.hallucinate.app/status?pass=vim5fwekx9"
    var request = new XMLHttpRequest();
    request.open('GET', url, false);  // `false` makes the request synchronous
    request.send(null);
    if (request.status === 200) {
        serverStatus = JSON.parse(request.responseText);
    }
    return serverStatus
}



function requestModelChange(model, uid, socket){
	let cwd = process.cwd()
	let timestamp = Date.now()
	let request ={
		"prompt": "Initialize Model",
		"iterations": 1,
		"threshold": 0,
		"perlin": 0,
		"progress_images": false,
		"progress_latents": true,
		"save_intermediates": 5,
		"model": model,
		"width": 64,
		"height": 64,
		"cfg_scale": 10,
		"sampler_name": 'k_dpmpp_2',
		"strength": 1,
		"steps": 1,
		"seed": Math.floor(Math.random() * 1000000),
		"init_mask": "",
		"seamless": false,
		"hires_fix": false,
		"variation_amount": 0,
		"generation_mode": "txt2img"

	}
	if (uid == undefined){
		uid = 'defaultUser'
	}
	let config = systemConfig(uid, model, null, socket)
	let translatedModelName = model
	let modelDict = fs.readFileSync("modelDict.json")
	modelDict = JSON.parse(modelDict)
	let thisModels = modelDict[3]
	for( var modelName in thisModels){
		let thisModel = thisModels[modelName]
		if (model.includes(modelName) ){
			for (var modelVersion in thisModel){
				let modelVersionName = modelVersion
				let civitai = thisModel[modelVersion]
				if(model.includes(modelVersion)){
					translatedModelName = civitai
				}
			}
		}
	}
	request["model"] = translatedModelName

	let results = undefined
	let results2 = undefined
	const response2 = ( async () => {
		results = await generateImage.main(request, false, false, timestamp, config, uid, socket)
		return results
	})();
	let serverStatus = getServerStatus()
	let workers = serverStatus["workers"]
	for( var worker in workers){
		let thisWorker = workers[worker]
		let thisModel = thisWorker["model"]
		if (Object.keys(config["model_list"]).includes(thisModel)){
			config["model_list"][thisModel]["status"] = "active"
		}
	}
	let queues = serverStatus["queue"]
	let thisQueue = {}
	for (var queue in queues){
		let queueIndex = queues[queue]
		let thisModel = queueIndex["model"]
		if (thisModel == model){
			thisQueue = queues[queue]
		}
	}
	if(!fs.existsSync(cwd + '/modelSelection.json')){
		fs.writeFileSync(cwd + '/modelSelection.json', JSON.stringify({}))
	}
	if(uid == undefined || uid == "" || uid == null){
		uid = "defaultUser"
	}
	let modelSelection = JSON.parse(fs.readFileSync(cwd + '/modelSelection.json'))
	modelSelection[uid] = model
	fs.writeFileSync(cwd + '/modelSelection.json', JSON.stringify(modelSelection))
	config["model_list"][model]["status"] == "active" 
	let output = {
		"model_name": model,
		"model_list": config["model_list"],
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
		data = JSON.parse(data)
		let token = data["token"]
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
		let dstPath = dir + "/gallery/" + token + "/" + fileName + "-uploaded" + ".png"
		// copy the file from the temporary location to the intended location
		fs.copyFileSync(tmpPath, dstPath)
		fs.rmSync(tmpPath)
		// create a thumbnail with jimp of the uploaded image
		let thumbnail = "./gallery/" + token + "/" + fileName + "-uploaded" + "-thumbnail" + ".png"
		let imgData = Jimp.read(dstPath)
		//resize the image to a maximum width of 200px and a maximum height of 200px
		imgData.then(function (image) {
			image.resize(256, 256)
			image.write(thumbnail)
		})
		// upload the image to s3
		command = "s3cmd --config=cw-object-storage-config_stable-diffusion put " + dstPath + " s3://gallery/" + token + "/" + fileName + "-uploaded" + ".png"
		results = execute("s3cmd", ["--config=cw-object-storage-config_stable-diffusion", "put", dstPath, "s3://gallery/" + token + "/" + fileName + "-uploaded" + ".png"])
		let output = {
			"height":imgData.height,
			"mtime":fs.statSync(dstPath).mtimeMs,
			"thumbnail":"outputs/" + token + "/" + fileName +  "-uploaded-thumbnail.png",
			"url":"outputs/" + token + "/" + fileName + "-uploaded.png",
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
		let token
		let config = systemConfig(sid, "", null, socket)
		if (Object.keys(config).includes("token")){
			token = config["token"]
		}
		else{
			token = undefined
		}
		socket.emit('systemConfig', config)
		//let images = requestImages("result", sid, 0, token, socket)
		//socket.emit('galleryImages', images)
		//images = requestImages("user", sid, 0, token, socket)
		//socket.emit('galleryImages', images)

		socket.on('disconnect', () => {
			console.log('Client disconnected');
		});

		let results = undefined
		let results2 = undefined
		socket.on('generateImage', function(request, request2, request3, ) {
			let modelSelection = fs.readFileSync("modelSelection.json")
			modelSelection = JSON.parse(modelSelection)
			let uid = "defaultUser"
			let model = modelSelection[uid]
			let translatedModelName = request["model"]
			let modelDict = fs.readFileSync("modelDict.json")
			modelDict = JSON.parse(modelDict)
			let thisModels = modelDict[3]
			for( var modelName in thisModels){
				let thisModel = thisModels[modelName]
				if (model.includes(modelName) ){
					for (var modelVersion in thisModel){
						let modelVersionName = modelVersion
						let civitai = thisModel[modelVersion]
						if(model.includes(modelVersion)){
							translatedModelName = civitai
						}
					}
				}
			}
			if (Object.keys(modelDict[0]).includes(translatedModelName)){
				if(Object.keys(modelDict[0][translatedModelName]).includes("trainedWords")){
					if(Object.keys(modelDict[0][translatedModelName]["trainedWords"]).length > 0){
						let trainedWords = modelDict[0][translatedModelName]["trainedWords"]
						let trainedWordsString = trainedWords.join(" ")
						request["prompt"]  = request["prompt"] + " " + trainedWordsString
					}
				}
			}
			request["model"] = translatedModelName
			console.log("Received a generateImage request");
			let timestamp = Date.now()
			const response = ( async () => {
				results = await generateImage.main(request, request2, request3, timestamp, config, uid , socket)
			})();
		});

		socket.on('requestImages', function(type, mtime, token) {
			if (type == "result"){
				console.log("Received a requestImages request for result images tokenID: " + token);
				let output = galleryImages.main(type, mtime, token, socket)
				socket.emit('galleryImages', output);
			}
			if (type == "user"){
				console.log("Received a requestImages request for user images tokenID: " + token);
				let output = galleryImages.main(type, mtime, token, socket)
				socket.emit('galleryImages', output);
			}
		});

		socket.on('deleteImage', function(filename, thunbnailname, fid, token, type) {
			cwd = process.cwd()
			console.log("Received a deleteImage request");
			filename = filename.replace("outputs/","gallery/")
			thunbnailname = thunbnailname.replace("outputs/","gallery/")
			if(fs.existsSync(cwd + "/" + filename)){
				fs.rmSync(cwd + "/" + filename)
			}
			if(fs.existsSync(cwd + "/" + thunbnailname)){
				fs.rmSync(cwd + "/" + thunbnailname)
			}
			let index = filename.replace("outputs/", "").replace(token + "/", "").replace(".png", "")
			if (fs.existsSync(cwd + "/" +"metadata.json")){
				let metadata = fs.readFileSync(cwd + "/" +"metadata.json")
				metadata = JSON.parse(metadata)
				delete metadata[index]
				fs.writeFileSync(cwd + "/" + "metadata.json", JSON.stringify(metadata))
			}
		});

		socket.on('requestModelChange', function(model, token) {
			console.log("Received a requestModelChange request");
			let uid = 'defaultUser'
			if (token != undefined){
				uid = token
			}
			let	output = requestModelChange(model, uid, socket)
			//socket.emit('modelChanged', output);
		});

		socket.on('sid', function(user) {
			console.log("Received a sid request");
			let	output = sid(t, socket)
			socket.emit('sid', output);
		});

		socket.on('systemConfig', function(user, token) {
			console.log("Received a systemConfig request");
			let	output = systemConfig(t, "", token, socket)
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