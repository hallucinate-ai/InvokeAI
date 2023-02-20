import express from 'express';
import http from 'http';
import { Server } from "socket.io";
import { createServer} from 'http';
import WebSocket from 'ws'
import jimp from 'jimp'
import fs from 'fs'
//import * as generateImage from './generateImage.js'
//import sleep from 'sleep'

function generateImage(request, socket){
	// make websocket request to api.hallucinate.app and get the image
	console.log("Generating image")
	console.log(request)
	// generate a random id for the image
	let id = Math.floor(Math.random() * 1000000000)

	let template = {
		"prompt": "test",
		"iterations": 1,
		"steps": 50,
		"cfg_scale": 7.5,
		"threshold": 0,
		"perlin": 0,
		"height": 512,
		"width": 512,
		"sampler_name": "k_lms",
		"seed": 1496138410,
		"progress_images": false,
		"progress_latents": true,
		"save_intermediates": 5,
		"generation_mode": "unifiedCanvas",
		"init_mask": "data:image/png;base64,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CJYuMgECBAgQMAD8AAECBAgQCAoYAMHSRSZAgAABAgaAHyBAgAABAkEBAyBYusgECBAgQMAA8AMECBAgQCAoYAAESxeZAAECBAgYAH6AAAECBAgEBQyAYOkiEyBAgAABA8APECBAgACBoIABECxdZAIECBAgYAD4AQIECBAgEBQwAIKli0yAAAECBAwAP0CAAAECBIICBkCwdJEJECBAgIAB4AcIECBAgEBQwAAIli4yAQIECBAwAPwAAQIECBAIChgAwdJFJkCAAAECBoAfIECAAAECQQEDIFi6yAQIECBAwADwAwQIECBAIChgAARLF5kAAQIECBgAfoAAAQIECAQFDIBg6SITIECAAAEDwA8QIECAAIGggAEQLF1kAgQIECBgAPgBAgQIECAQFDAAgqWLTIAAAQIEDAA/QIAAAQIEggIGQLB0kQkQIECAgAHgBwgQIECAQFDAAAiWLjIBAgQIEDAA/AABAgQIEAgKGADB0kUmQIAAAQIGgB8gQIAAAQJBAQMgWLrIBAgQIEDAAPADBAgQIEAgKGAABEsXmQABAgQIGAB+gAABAgQIBAUMgGDpIhMgQIAAAQPADxAgQIAAgaCAARAsXWQCBAgQIGAA+AECBAgQIBAUMACCpYtMgAABAgQMAD9AgAABAgSCAgZAsHSRCRAgQICAAeAHCBAgQIBAUMAACJYuMgECBAgQMAD8AAECBAgQCAoYAMHSRSZAgAABAgaAHyBAgAABAkEBAyBYusgECBAgQMAA8AMECBAgQCAoYAAESxeZAAECBAgYAH6AAAECBAgEBQyAYOkiEyBAgAABA8APECBAgACBoIABECxdZAIECBAgYAD4AQIECBAgEBQwAIKli0yAAAECBAwAP0CAAAECBIICBkCwdJEJECBAgIAB4AcIECBAgEBQwAAIli4yAQIECBAwAPwAAQIECBAIChgAwdJFJkCAAAECBoAfIECAAAECQQEDIFi6yAQIECBAwADwAwQIECBAIChgAARLF5kAAQIECBgAfoAAAQIECAQFDIBg6SITIECAAAEDwA8QIECAAIGggAEQLF1kAgQIECBgAPgBAgQIECAQFDAAgqWLTIAAAQIEDAA/QIAAAQIEggIGQLB0kQkQIECAgAHgBwgQIECAQFDAAAiWLjIBAgQIEDAA/AABAgQIEAgKGADB0kUmQIAAAQIGgB8g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oIABECxdZAIECBAgYAD4AQIECBAgEBQwAIKli0yAAAECBAwAP0CAAAECBIICBkCwdJEJECBAgIAB4AcIECBAgEBQwAAIli4yAQIECBAwAPwAAQIECBAIChgAwdJFJkCAAAECBoAfIECAAAECQQEDIFi6yAQIECBAwADwAwQIECBAIChgAARLF5kAAQIECBgAfoAAAQIECAQFDIBg6SITIECAAAEDwA8QIECAAIGggAEQLF1kAgQIECBgAPgBAgQIECAQFDAAgqWLTIAAAQIEDAA/QIAAAQIEggIGQLB0kQkQIECAgAHgBwgQIECAQFDAAAiWLjIBAgQIEDAA/AABAgQIEAgKGADB0kUmQIAAAQIGgB8gQIAAAQJBAQMgWLrIBAgQIEDAAPADBAgQIEAgKGAABEsXmQABAgQIGAB+gAABAgQIBAUMgGDpIhMgQIAAAQPADxAgQIAAgaCAARAsXWQCBAgQIGAA+AECBAgQIBAUMACCpYtMgAABAgQMAD9AgAABAgSCAgZAsHSRCRAgQICAAeAHCBAgQIBAUMAACJYuMgECBAgQMAD8AAECBAgQCAoYAMHSRSZAgAABAgaAHyBAgAABAkEBAyBYusgECBAgQMAA8AMECBAgQCAoYAAESxeZAAECBAgYAH6AAAECBAgEBQyAYOkiEyBAgAABA8APECBAgACBoIABECxdZAIECBAgYAD4AQIECBAgEBQwAIKli0yAAAECBAwAP0CAAAECBIICBkCwdJEJECBAgIAB4AcIECBAgEBQwAAIli4yAQIECBAwAPwAAQIECBAIChgAwdJFJkCAAAECBoAfIECAAAECQQEDIFi6yAQIECBAwADwAwQIECBAIChgAARLF5kAAQIECBgAfoAAAQIECAQFDIBg6SITIECAAAEDwA8QIECAAIGggAEQLF1kAgQIECBgAPgBAgQIECAQFDAAgqWLTIAAAQIEDAA/QIAAAQIEggIGQLB0kQkQIECAgAHgBwgQIECAQFDAAAiWLjIBAgQIEDAA/AABAgQIEAgKGADB0kUmQIAAAQIGgB8gQIAAAQJBAQMgWLrIBAgQIEDAAPADBAgQIEAgKGAABEsXmQABAgQIGAB+gAABAgQIBAUMgGDpIhMgQIAAAQPADxAgQIAAgaCAARAsXWQCBAgQIGAA+AECBAgQIBAUMACCpYtMgAABAgQMAD9AgAABAgSCAgZAsHSRCRAgQICAAeAHCBAgQIBAUMAACJYuMgECBAgQMAD8AAECBAgQCAoYAMHSRSZAgAABAgaAHyBAgAABAkEBAyBYusgECBAgQMAA8AMECBAgQCAoYAAESxeZAAECBAgYAH6AAAECBAgEBQyAYOkiEyBAgAABA8APECBAgACBoIABECxdZAIECBAgYAD4AQIECBAgEBQwAIKli0yAAAECBAwAP0CAAAECBIICBkCwdJEJECBAgIAB4AcIECBAgEBQwAAIli4yAQIECBB40W/6ahZLM0wAAAAASUVORK5CYII=",
		"fit": false,
		"strength": 0.75,
		"invert_mask": false,
		"bounding_box": {
		  "x": 0,
		  "y": 0,
		  "width": 512,
		  "height": 512
		},
		"init_img": "data:image/png;base64,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MACCpYtMgAABAgQMAD9AgAABAgSCAgZAsHSRCRAgQICAAeAHCBAgQIBAUMAACJYuMgECBAgQMAD8AAECBAgQCAoYAMHSRSZAgAABAgaAHyBAgAABAkEBAyBYusgECBAgQMAA8AMECBAgQCAoYAAESxeZAAECBAgYAH6AAAECBAgEBQyAYOkiEyBAgAABA8APECBAgACBoIABECxdZAIECBAgYAD4AQIECBAgEBQwAIKli0yAAAECBAwAP0CAAAECBIICBkCwdJEJECBAgIAB4AcIECBAgEBQwAAIli4yAQIECBAwAPwAAQIECBAIChgAwdJFJkCAAAECBoAfIECAAAECQQEDIFi6yAQIECBAwADwAwQIECBAIChgAARLF5kAAQIECBgAfoAAAQIECAQFDIBg6SITIECAAAEDwA8QIECAAIGggAEQLF1kAgQIECBgAPgBAgQIECAQFDAAgqWLTIAAAQIEDAA/QIAAAQIEggIGQLB0kQkQIECAgAHgBwgQIECAQFDAAAiWLjIBAgQIEDAA/AABAgQIEAgKGADB0kUmQIAAAQIGgB8gQIAAAQJBAQMgWLrIBAgQIEDAAPADBAgQIEAgKGAABEsXmQABAgQIGAB+gAABAgQIBAUMgGDpIhMgQIAAAQPADxAgQIAAgaCAARAsXWQCBAgQIGAA+AECBAgQIBAUMACCpYtMgAABAgQMAD9AgAABAgSCAgZAsHSRCRAgQICAAeAHCBAgQIBAUMAACJYuMgECBAgQMAD8AAECBAgQCAoYAMHSRSZAgAABAgaAHyBAgAABAkEBAyBYusgECBAgQMAA8AMECBAgQCAoYAAESxeZAAECBAgYAH6AAAECBAgEBQyAYOkiEyBAgAABA8APECBAgACBoIABECxdZAIECBAgYAD4AQIECBAgEBQwAIKli0yAAAECBAwAP0CAAAECBIICBkCwdJEJECBAgIAB4AcIECBAgEBQwAAIli4yAQIECBAwAPwAAQIECBAIChgAwdJFJkCAAAECBoAfIECAAAECQQEDIFi6yAQIECBAwADwAwQIECBAIChgAARLF5kAAQIECBgAfoAAAQIECAQFDIBg6SITIECAAAEDwA8QIECAAIGggAEQLF1kAgQIECBgAPgBAgQIECAQFDAAgqWLTIAAAQIEDAA/QIAAAQIEggIGQLB0kQkQIECAgAHgBwgQIECAQFDAAAiWLjIBAgQIEDAA/AABAgQIEAgKGADB0kUmQIAAAQIGgB8gQIAAAQJBAQMgWLrIBAgQIEDAAPADBAgQIEAgKGAABEsXmQABAgQIGAB+gAABAgQIBAUMgGDpIhMgQIAAAQPADxAgQIAAgaCAARAsXWQCBAgQIGAA+AECBAgQIBAUMACCpYtMgAABAgQMAD9AgAABAgSCAgZAsHSRCRAgQICAAeAHCBAgQIBAUMAACJYuMgECBAgQMAD8AAECBAgQCAoYAMHSRSZAgAABAgaAHyBAgAABAkEBAyBYusgECBAgQMAA8AMECBAgQCAoYAAESxeZAAECBAgYAH6AAAECBAgEBQyAYOkiEyBAgAABA8APECBAgACBoIABECxdZAIECBAgYAD4AQIECBAgEBQwAIKli0yAAAECBAwAP0CAAAECBIICBkCwdJEJECBAgIAB4AcIECBAgEBQwAAIli4yAQIECBAwAPwAAQIECBAIChgAwdJFJkCAAAECBoAfIECAAAECQQEDIFi6yAQIECBAwADwAwQIECBAIChgAARLF5kAAQIECBgAfoAAAQIECAQFDIBg6SITIECAAAEDwA8QIECAAIGggAEQLF1kAgQIECBgAPgBAgQIECAQFDAAgqWLTIAAAQIEDAA/QIAAAQIEggIGQLB0kQkQIECAgAHgBwgQIECAQFDAAAiWLjIBAgQIEDAA/AABAgQIEAgKGADB0kUmQIAAAQIGgB8gQIAAAQJBAQMgWLrIBAgQIEDAAPADBAgQIEAgKGAABEsXmQABAgQIGAB+gAABAgQIBAUMgGDpIhMgQIAAAQPADxAgQIAAgaCAARAsXWQCBAgQIGAA+AECBAgQIBAUMACCpYtMgAABAgQMAD9AgAABAgSCAgZAsHSRCRAgQICAAeAHCBAgQIBAUMAACJYuMgECBAgQMAD8AAECBAgQCAoYAMHSRSZAgAABAgaAHyBAgAABAkEBAyBYusgECBAgQMAA8AMECBAgQCAoYAAESxeZAAECBAgYAH6AAAECBAgEBQyAYOkiEyBAgAABA8APECBAgACBoIABECxdZAIECBAgYAD4AQIECBAgEBQwAIKli0yAAAECBAwAP0CAAAECBIICBkCwdJEJECBAgIAB4AcIECBAgEBQwAAIli4yAQIECBAwAPwAAQIECBAIChgAwdJFJkCAAAECBoAfIECAAAECQQEDIFi6yAQIECBAwADwAwQIECBAIChgAARLF5kAAQIECBgAfoAAAQIECAQFDIBg6SITIECAAAEDwA8QIECAAIGggAEQLF1kAgQIECBgAPgBAgQIECAQFDAAgqWLTIAAAQIEDAA/QIAAAQIEggIGQLB0kQkQIECAgAHgBwgQIECAQFDAAAiWLjIBAgQIEDAA/AABAgQIEAgKGADB0kUmQIAAAQIGgB8gQIAAAQJBAQMgWLrIBAgQIEDAAPADBAgQIEAgKGAABEsXmQABAgQIGAB+gAABAgQIBAUMgGDpIhMgQIAAAQPADxAgQIAAgaCAARAsXWQCBAgQIGAA+AECBAgQIBAUMACCpYtMgAABAgQMAD9AgAABAgSCAgZAsHSRCRAgQICAAeAHCBAgQIBAUMAACJYuMgECBAgQMAD8AAECBAgQCAoYAMHSRSZAgAABAgaAHyBAgAABAkEBAyBYusgECBAgQMAA8AMECBAgQCAoYAAESxeZAAECBAgYAH6AAAECBAgEBQyAYOkiEyBAgAABA8APECBAgACBoIABECxdZAIECBAgYAD4AQIECBAgEBQwAIKli0yAAAECBAwAP0CAAAECBIICBkCwdJEJECBAgIAB4AcIECBAgEBQwAAIli4yAQIECBAwAPwAAQIECBAIChgAwdJFJkCAAAECBoAfIECAAAECQQEDIFi6yAQIECBAwADwAwQIECBAIChgAARLF5kAAQIECBgAfoAAAQIECAQFDIBg6SITIECAAAEDwA8QIECAAIGggAEQLF1kAgQIECBgAPgBAgQIECAQFDAAgqWLTIAAAQIEDAA/QIAAAQIEggIGQLB0kQkQIECAgAHgBwgQIECAQFDAAAiWLjIBAgQIEDAA/AABAgQIEAgKGADB0kUmQIAAAQIGgB8gQIAAAQJBAQMgWLrIBAgQIEDAAPADBAgQIEAgKGAABEsXmQABAgQIGAB+gAABAgQIBAUMgGDpIhMgQIAAAQPADxAgQIAAgaCAARAsXWQCBAgQIGAA+AECBAgQIBAUMACCpYtMgAABAgQMAD9AgAABAgSCAgZAsHSRCRAgQICAAeAHCBAgQIBAUMAACJYuMgECBAgQMAD8AAECBAgQCAoYAMHSRSZAgAABAgaAHyBAgAABAkEBAyBYusgECBAgQMAA8AMECBAgQCAoYAAESxeZAAECBAgYAH6AAAECBAgEBQyAYOkiEyBAgAABA8APECBAgACBoIABECxdZAIECBAgYAD4AQIECBAgEBQwAIKli0yAAAECBAwAP0CAAAECBIICBkCwdJEJECBAgIAB4AcIECBAgEBQwAAIli4yAQIECBAwAPwAAQIECBAIChgAwdJFJkCAAAECBoAfIECAAAECQQEDIFi6yAQIECBAwADwAwQIECBAIChgAARLF5kAAQIECBgAfoAAAQIECAQFDIBg6SITIECAAIEH9IYCAbVe32sAAAAASUVORK5CYII=",
		"inpaint_width": 512,
		"inpaint_height": 512,
		"seam_size": 96,
		"seam_blur": 16,
		"seam_strength": 0.7,
		"seam_steps": 30,
		"tile_size": 32,
		"infill_method": "patchmatch",
		"force_outpaint": false,
		"variation_amount": 0
	}

	let task = {
		"command": "diffuse",
		"model": 'stable-diffusion-v1.5',
		"prompt": request["prompt"],
		"width": request["width"],
		"height": request["height"],
		"sampler_name": 'k',
		"sampler_args": {
			"schedule": 'lms'
		},
		"cfg_scale": request["cfg_scale"],
		"denoising_strength": request["strength"],
		"steps": request["steps"],
		"seed": request["seed"],
		"timestamp": Date.now(),
		"input_image": request["init_img"],
		"mask_image": request["init_mask"],
		"id": id
	}
	let context = request["init_img"]
	context = context.replace(/^data:image\/\w+;base64,/, "")
	let mask = request["init_mask"]
	mask = mask.replace(/^data:image\/\w+;base64,/, "")

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
					if (fs.existsSync('output.jpg'))
						fs.unlinkSync('output.jpg')
	
					expectedBytes = payload.length
					console.log('compute finished: expecting', expectedBytes, 'bytes')
					console.log(payload)

					break
	
				case 'chunk':
					let blob = Buffer.from(payload.blob, 'base64')
	
					fs.appendFileSync('output.jpg', blob)
					expectedBytes -= blob.length
	
					console.log('received bytes:', expectedBytes, 'to go')
	
					if(expectedBytes <= 0){
						console.log('done')
						let imagedata = fs.readFileSync('output.jpg', {encoding: 'base64'})
						let output = {
							"url": "outputs/temp-images/000018.fdec8761.4028965222.png",
							"thumbnail": "outputs/thumbnails/000018.fdec8761.4028965222.webp",
							"mtime": 1676801456.6904244,
							"metadata": {
							  "model": "stable diffusion",
							  "model_weights": "stable-diffusion-1.5",
							  "model_hash": "cc6cb27103417325ff94f52b7a5d2dde45a7515b25c255d8e396c90014281516",
							  "app_id": "invoke-ai/InvokeAI",
							  "app_version": "2.2.5",
							  "image": {
								"prompt": [
								  {
									"prompt": "a dog on a coin",
									"weight": 1
								  }
								],
								"steps": 50,
								"cfg_scale": 7.5,
								"threshold": 0,
								"perlin": 0,
								"height": 512,
								"width": 512,
								"seed": 4028965222,
								"type": "unifiedCanvas",
								"postprocessing": null,
								"sampler": "k_lms",
								"variations": []
							  }
							},
							"dreamPrompt": "\"a dog on a coin\" -s 50 -S 4028965222 -W 512 -H 512 -C 7.5 -A k_lms",
							"width": 512,
							"height": 512,
							"boundingBox": {
							  "x": 0,
							  "y": 0,
							  "width": 512,
							  "height": 512
							},
							"generationMode": "unifiedCanvas",
							"attentionMaps": "data:image/png;base64,",
							"tokens": [
								"a</w>",
								"dog</w>",
								"on</w>",
								"a</w>",
								"coin</w>"
							]
						}
					socket.emit("generationResult", output)
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
	
		if(mask){
			send({
				command: 'upload_image',
				id: 'mask',
				blob: mask.toString('base64')
			})
			console.log('sent mask')
		}
	
	
		send({
			...task,
			command: 'diffuse',
			id: 'task',
			input_image: context ? 'ctx' : undefined,
			mask_image: mask ? 'mask' : undefined,
		})
	
		console.log('sent task:', task)
	})
	
	HallucinateAPI.on('close', code => {
		console.log('socket closed: code', code)
	})

	return output
}

function galleryImages(user){
	let images = []
	let files = fs.readdirSync('public/images/users/' + user + '/gallery')
	let metadata = fs.readFileSync('public/images/users/' + user + '/gallery/metadata.json')
	metadata = JSON.parse(metadata)
	files.forEach(file => {
		if(!Object.keys(metadata).includes(file)){
			let metadataTemplate = {
				"model": "stable diffusion",
				"model_weights": "stable-diffusion-1.5",
				"model_hash": "cc6cb27103417325ff94f52b7a5d2dde45a7515b25c255d8e396c90014281516",
				"app_id": "invoke-ai/InvokeAI",
				"app_version": "2.2.5",
				"image": {
					"prompt": [
						{
							"prompt": "Underwater city",
							"weight": 1
						}
					],
					"steps": 50,
					"cfg_scale": 7.5,
					"threshold": 0,
					"perlin": 0,
					"height": 512,
					"width": 512,
					"seed": 916798825,
					"seamless": false,
					"hires_fix": false,
					"type": "txt2img",
					"postprocessing": null,
					"sampler": "k_lms",
					"variations": []
				}
			}
			thisMetadata = metadata[file];
		}
		let imageTemplate = {
				"url": "outputs/init-images/000003.d29dc765.916798825.cebc11c1.png",
				"thumbnail": "outputs/thumbnails/000003.d29dc765.916798825.cebc11c1.webp",
				"mtime": 1675878801.8941083,
				"metadata": thisMetadata,
				"dreamPrompt": "\"Underwater city\" -s 50 -S 916798825 -W 512 -H 512 -C 7.5 -A k_lms",
				"width": 512,
				"height": 512,
				"category": "user"
			}
		images.push(imageTemplate)
	});
	let output = {
		"images": images,
		"areMoreImagesAvailable": false,
		"category": "user"
	}
	return output
}

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

server.listen(process.env.PORT || 9090, function() {
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