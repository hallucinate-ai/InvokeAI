import jimp from 'jimp'
import WebSocket from 'ws'
import fs from 'fs'
import { spawn } from 'child_process'
import { exec } from 'child_process';
import * as child_process from "child_process";

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

export function main(request, request2, request3, timestamp,){
	// make websocket request to api.hallucinate.app and get the image
	console.log("Generating image")
	console.log(request)
	// generate a random id for the image
	let id = Math.floor(Math.random() * 1000000000)
	let cwd = process.cwd()
	//let dir = path.dirname(new URL(import.meta.url).pathname)	let timestamp = Date.now()
	let context = ""
	let task = { }
	if(request2 != undefined && request2 != null && request2 != "" && request2 != false){
		if(request3 != undefined && request3 != null && request3 != "" && request3 != false){
			task = {
				"command": "diffuse",
				"model": "gfpgan",
				"denoising_strength": request["strength"],
				"timestamp": Date.now(),
				"input_image": request["init_img"],
				"id": id
			}
			//context = fs.readFileSync(cwd + '/gallery/defaultUser/' + timestamp + '.png')
		}
		else {
			task = {
				"command": "diffuse",
				"model": "realesrgan",
				"denoising_strength": request["strength"],
				"timestamp": Date.now(),
				"input_image": request["init_img"],
				"id": id
			}
			//context = fs.readFileSync(cwd + '/gallery/defaultUser/' + timestamp + '.png')
		}
		console.log("generating enhancement")
	}

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
					if (fs.existsSync('./gallery/defaultUser/' + timestamp + '-upscaled.png'))
						fs.unlinkSync('./gallery/defaultUser/' + timestamp + '-upscaled.png')
	
					expectedBytes = payload.length
					console.log('compute finished: expecting', expectedBytes, 'bytes')
					console.log(payload)

					break
	
				case 'chunk':
					let blob = Buffer.from(payload.blob, 'base64')
	
					fs.appendFileSync('./gallery/defaultUser/' + timestamp + '-upscaled.png', blob)
					expectedBytes -= blob.length
	
					console.log('received bytes:', expectedBytes, 'to go')
	
					if(expectedBytes <= 0){
						console.log('done')
						
						let imagedata = fs.readFileSync('./gallery/defaultUser/' + timestamp + '.png' + timestamp + '.png', {encoding: 'base64'})
						//make a thumbnail with jimp
						let thumbnail = Jimp.read(timestamp + '.png')
						thumbnail.resize(256, 256)
						thumbnail.write('./gallery/defaultUser/' + timestamp + "-"+ thumbnail + '.png')

						if(!fs.existsSync('./gallery/defaultUser/metadata.json')){
							let metadata = {}
							fs.writeFileSync('./gallery/defaultUser/metadata.json', JSON.stringify(metadata))
						}
						if(fs.existsSync('./gallery/defaultUser/metadata.json')){
							let metadata = fs.readFileSync('./gallery/defaultUser/metadata.json', 'utf8')
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
							metadata[timestamp.toString()] = imageMetadata
							fs.writeFileSync('./gallery/defaultUser/metadata.json', JSON.stringify(metadata))
							command = "s3cmd put ./gallery/defaultUser/metadata.json s3://gallery/metadata.json"
							results = execute(command)
						}
						tokens = request["prompt"].split(" ")
						for(let i = 0; i < tokens.length; i++){
							if(tokens[i].startsWith("-")){
								tokens[i] = tokens[i] + "</w>"
							}
						}
						let mtime = fs.statSync('./gallery/' + timestamp + "-upscaled.png").mtime
						let template = {
							"url": "gallery/" + timestamp + ".png",
							"thumbnail": "gallery/" + timestamp + "-thumbnail.png",
							"mtime": mtime,
							"metadata":metadata,
							"dreamPrompt": "\""+ request["prompt"]+"\" -s "+ request["steps"] +" -S "+ request["seed"]+ " -W " + request["width"] +" -H " + request["height"] +" -C " + request["cfg_scale"] + " -A " + request["attention_maps"] + " -P " + request["perlin"] + " -T " + request["threshold"] + " -G " + request["generation_mode"] + " -M " + request["sampler_name"],
							"width": request["width"],
							"height": request["height"],
							"boundingBox": {
							  "x": request["bounding_box"]["x"],
							  "y": request["bounding_box"]["y"],
							  "width": request["bounding_box"]["width"],
							  "height": request["bounding_box"]["height"]
							},
							"generationMode": request["generation_mode"],
							"attentionMaps": "data:image/png;base64,",
							"tokens": tokens
						}
						fs.writeFileSync('./gallery/defaultUser/' + timestamp + '-upscaled.png', JSON.stringify(template))
						socket.emit("generationResult", template)
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