import jimp from 'jimp'
import WebSocket from 'ws'
import fs from 'fs'
import { spawn } from 'child_process'
import { exec } from 'child_process';
import * as child_process from "child_process";
import * as fixfaces from './fixfaces.js'

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


function upscale(request, request2, request3, timestamp, task, context, socket){
	let cwd = process.cwd()
	console.log("upscale called")
	var output = {}
	var HallucinateAPI = new WebSocket('wss://api.hallucinate.app')
	const send = payload => HallucinateAPI.send(JSON.stringify(payload))

	HallucinateAPI.on('open', () => {
		let expectedBytes
		
		console.log('connection accepted')
		HallucinateAPI.on('message', raw => {
			let { event, ...payload } = JSON.parse(raw)
	
			switch (event) {
				case 'queue':
					console.log('position in queue is:', payload.position)
					break
				
				case 'progress':
					console.log(
						'progress:', 
						payload.stage, 
						payload.value
							? `${Math.round(payload.value * 100)}%`
							: ``
					)
					let progressDict = {
						"url": "data:image/png;base64,",							
						"isBase64": true,
						"mtime": 0,
						"metadata": {},
						"width": request["width"],
						"height": request["height"],
						"generationMode": request["generationMode"],
						"boundingBox": null
					}
					
					socket.emit('IntermediateResult', progressDict);
					let output = {
						"currentStep": parseInt(request["steps"]) * payload.value,
						"totalSteps": request["steps"],
						"currentIteration": 1,
						"totalIterations": 1,
						"currentStatus": "common:statusPreparing",
						"isProcessing": true,
						"currentStatusHasSteps": false,
						"hasError": false
					}
					socket.emit("progressUpdate", output);
					break
	
				case 'error':
					console.log('error:', payload.message)
					break
	
				case 'result':
					if (fs.existsSync('./gallery/' + request["token"] + '/' + timestamp + '-upscaled.png'))
						fs.unlinkSync('./gallery/' + request["token"] + '/' + timestamp + '-upscaled.png')
	
					expectedBytes = payload.length
					console.log('compute finished: expecting', expectedBytes, 'bytes')
					console.log(payload)

					break
	
				case 'chunk':
					let blob = Buffer.from(payload.blob, 'base64')
	
					fs.appendFileSync('./gallery/' + request["token"] + '/' + timestamp + '-upscaled.png', blob)
					expectedBytes -= blob.length
	
					console.log('received bytes:', expectedBytes, 'to go')
	
					if(expectedBytes <= 0){
						console.log('done')
						
						if(!fs.existsSync('./gallery/' + request["token"] + '/metadata.json')){
							let metadata = {}
							fs.writeFileSync('./gallery/' + request["token"] + '/metadata.json', JSON.stringify(metadata))
						}
						let metadata = ""
						if(fs.existsSync('./gallery/' + request['token'] + '/metadata.json')){
							metadata = fs.readFileSync('./gallery/' + request['token'] + '/metadata.json', 'utf8')
							metadata = JSON.parse(metadata)
							let imageMetadata =  {
								"model": "stable diffusion",
								"model_weights": "stable-diffusion-1.5",
								"model_hash": "cc6cb27103417325ff94f52b7a5d2dde45a7515b25c255d8e396c90014281516",
								"app_id": "invoke-ai/InvokeAI",
								"app_version": "2.2.5",
								"image": {
								  "prompt": [
									{
									  "prompt": request["prompt"],
									  "weight": 1
									}
								  ],
								  "steps": request["steps"],
								  "cfg_scale": request["cfg_scale"],
								  "threshold": request["threshold"],
								  "perlin": request["perlin"],
								  "height": request["height"],
								  "width": request["width"],
								  "seed": request["seed"],
								  "type": request["generation_mode"],
								  "postprocessing": null,
								  "sampler": request["sampler_name"],
								  "variations": []
								}
							}
							let index = timestamp.toString()
							metadata[index] = {}
							metadata[index] = imageMetadata
							fs.writeFileSync('./gallery/' + request['token'] + '/metadata.json', JSON.stringify(metadata))
							let command = "s3cmd --config="+cwd+"/cw-object-storage-config_stable-diffusion sync " + cwd + "/gallery/"+ request['token'] + "/metadata.json s3://gallery/"+ request['token'] + "metadata.json"
							let results = child_process.execSync(command)
					
							let tokens = request["prompt"].split(" ")
							for(let i = 0; i < tokens.length; i++){
								if(tokens[i].startsWith("-")){
									tokens[i] = tokens[i] + "</w>"
								}
							}
							let mtime = fs.statSync('./gallery/'+ request['token'] + '/' + timestamp + ".png").mtime
							let bounding_box = {}
							if (Object.keys(request).includes("bounding_box")){
								bounding_box = request["bounding_box"]
							}

							let output4 = {
								"currentStep": 0,
								"totalSteps": 0,
								"currentIteration": 0,
								"totalIterations": 0,
								"currentStatus": "common:statusProcessingComplete",
								"isProcessing": false,
								"currentStatusHasSteps": true,
								"hasError": false
							}
							socket.emit("progressUpdate", output4);

							let template = {
								"url": "outputs/" + request['token'] + "/" + timestamp + ".png",
								"thumbnail": "outputs/" + request['token'] + "/" + timestamp + "-thumbnail.png",
								"mtime": mtime,
								"metadata":metadata,
								"dreamPrompt": "\""+ request["prompt"]+"\" -s "+ request["steps"] +" -S "+ request["seed"]+ " -W " + request["width"] +" -H " + request["height"] +" -C " + request["cfg_scale"] + " -A " + request["attention_maps"] + " -P " + request["perlin"] + " -T " + request["threshold"] + " -G " + request["generation_mode"] + " -M " + request["sampler_name"],
								"width": request["width"],
								"height": request["height"],
								"boundingBox": bounding_box,
								"generationMode": request["generation_mode"],
								"attentionMaps": "data:image/png;base64,",
								"tokens": tokens
							}+
							fs.unlinkSync('./gallery/' + request['token'] + "/" + timestamp + ".png")
							command = "mv " + cwd + "/gallery/" + request['token'] + "/" + timestamp + "-upscaled.png " + cwd + "/gallery/" + request['token'] + "/" + timestamp + ".png"
							child_process.execSync(command)
							//fs.writeFileSync('./gallery/defaultUser/metadata.json', JSON.stringify(template))
							if (request3 == false)
								socket.emit("generationResult", template)
							else{
								fixfaces.main(request, request2, request3, timestamp, socket)
							}
						}
					}
					break
				}
			})
	
	
		if(context){
			send({
				command: 'upload_image',
				id: 'ctx',
				blob: context.toString('base64')
			})
			console.log('sent context')
		}
		let mask = ""
		if(mask){
			send({
				command: 'upload_image',
				id: 'mask',
				blob: mask.toString('base64')
			})
			console.log('sent mask')
		}
		//context = fs.readFileSync(cwd + '/gallery/defaultUser/' + timestamp + '.png')
		send({
			...task,
			command: 'diffuse',
			id: 'task',
			input_image: context ? 'ctx' : undefined,
			mask_image: mask ? 'mask' : undefined,
		})
	
		console.log('sent task:', task)
		return output

	})

	HallucinateAPI.on('close', code => {
		console.log('socket closed: code', code)
	})
}

export function main(request, request2, request3, timestamp, socket){
	// make websocket request to api.hallucinate.app and get the image
	console.log("Enhancing image")
	console.log(request2)
	// generate a random id for the image
	let results = undefined
	let id = Math.floor(Math.random() * 1000000000)
	let cwd = process.cwd()
	//let dir = path.dirname(new URL(import.meta.url).pathname)	let timestamp = Date.now()
	let context = ""
	let task = {}
	if(request2 != false  ){
		task = {
			"command": "diffuse",
			"model": "real-esrgan",
			"level": request2["level"],
			"upscale_strength": request2["strength"],
			"timestamp": Date.now(),
			"input_image": request["init_img"],
			"id": id
		}
		context = fs.readFileSync(cwd + '/gallery/' + request['token'] + "/" + timestamp + '.png')
		let results = upscale(request, request2, request3, timestamp, task, context, socket)
	} 
	return results
}
