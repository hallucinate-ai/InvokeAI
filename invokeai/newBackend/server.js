import fs from 'fs'
import { resolve } from 'path'
import WebSocket from 'ws'
import { createServer } from 'https';
import { readFileSync } from 'fs';
import { WebSocketServer } from 'ws';
import express from 'express';
import bodyParser from 'body-parser';
import sha1 from 'sha1';
import { createHttpTerminator } from 'http-terminator';
import killport from 'kill-port';

function sid(){

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

function intermediateResult(sid){
	let output = {
		"url": "data:image/png;base64,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",
		"isBase64": true,
		"mtime": 0,
		"metadata": {},
		"width": 512,
		"height": 512,
		"generationMode": "txt2img",
		"boundingBox": null
	}
	return output
}

function progressUpdate(sid){
	let output = {
		"currentStep": 1,
		"totalSteps": 50,
		"currentIteration": 1,
		"totalIterations": 1,
		"currentStatus": "common:statusPreparing",
		"isProcessing": true,
		"currentStatusHasSteps": false,
		"hasError": false
	}
	return output
}

function requestImages(user){
	let output ={}
	return output
}



function systemConfig(){
	let output = {
	}
	return output
}


function generateImage(sid){
	// make websocket request to api.hallucinate.app and get the image
	HallucinateAPI = new WebSocket('wss://api.hallucinate.app')
	HallucinateAPI.onopen =function (event) {
		HallucinateAPI.send(JSON.stringify({
			"event": "generateImage",
			"sid": sid
		}))

	}
	let output = {
			"prompt": "test",
			"iterations": 1,
			"steps": 50,
			"cfg_scale": 7.5,
			"threshold": 0,
			"perlin": 0,
			"height": 512,
			"width": 512,
			"sampler_name": "k_lms",
			"seed": 946057800,
			"progress_images": false,
			"progress_latents": true,
			"save_intermediates": 5,
			"generation_mode": "txt2img",
			"init_mask": "",
			"seamless": false,
			"hires_fix": false,
			"variation_amount": 0
	}
	return output
}

function galleryImages(sid){
	let output = {
		"images": [
			{
				"url": "outputs/init-images/image.232448b8.png",
				"thumbnail": "outputs/thumbnails/image.232448b8.webp",
				"mtime": 1675880224.6293921,
				"metadata": {},
				"dreamPrompt": "",
				"width": 512,
				"height": 512,
				"category": "user"
			},
			{
				"url": "outputs/init-images/image.761dd203.png",
				"thumbnail": "outputs/thumbnails/image.761dd203.webp",
				"mtime": 1675880045.4584277,
				"metadata": {},
				"dreamPrompt": "",
				"width": 512,
				"height": 512,
				"category": "user"
			},
			{
				"url": "outputs/init-images/000003.d29dc765.916798825.cebc11c1.png",
				"thumbnail": "outputs/thumbnails/000003.d29dc765.916798825.cebc11c1.webp",
				"mtime": 1675878801.8941083,
				"metadata": {
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
				},
				"dreamPrompt": "\"Underwater city\" -s 50 -S 916798825 -W 512 -H 512 -C 7.5 -A k_lms",
				"width": 512,
				"height": 512,
				"category": "user"
			}
		],
		"areMoreImagesAvailable": false,
		"category": "user"
	}
	return output
}
//http://127.0.0.1:9090/socket.io/?EIO=4&transport=polling&t=OP042ev
//response
//0{"sid":"d5hIjQNSRUnNHhlwAAAE","upgrades":["websocket"],"pingTimeout":60000,"pingInterval":100000}
//http://127.0.0.1:9090/socket.io/?EIO=4&transport=polling&t=OP042fQ&sid=d5hIjQNSRUnNHhlwAAAE
//resposne
//OK
//http://127.0.0.1:9090/socket.io/?EIO=4&transport=polling&t=OP042fS&sid=d5hIjQNSRUnNHhlwAAAE
//6
// ws://127.0.0.1:9090/socket.io/?EIO=4&transport=websocket&sid=u2tIUYFK_B8AHAy2AAAC
// up "2probe"
// down "3probe"
// up "5" // number of websocket messages in the queue
// 



function startWebsocket (start){
	// open a websocket listener

	if (start == true){
		killport(9090)
		setInterval(function(){ console.log("waiting for websocket to start"); }, 3000);
		console.log('starting websocket on port 9090')
		const ws = new WebSocketServer({ port: 9090 })
		// new websocket server
		// when a client connects
		ws.on('connection', (socket) => {
			// create a file stream
			const fileStream = fs.createWriteStream(resolve(__dirname, 'output.jpg'))

			// when a message is received
			socket.on('message', (message) => {
				// parse the message
				const { event, ...payload } = JSON.parse(message)

				// handle the event
				switch (event) {
					case 'chunk':
						// write the chunk to the file stream
						fileStream.write(Buffer.from(payload.blob, 'base64'))
						break

					case 'error':
						// log the error
						console.log('error:', payload.message)
						break

					case 'sid':
						let sid = sid()
						socket.send(JSON.stringify({
							event: 'sid',
							sid: sid
						}))
						break
			
					case 'requestImages':
						output = requestImages(user)
						socket.send(JSON.stringify({
							event: 'requestImages',
							output: output
						}))
						break

					case 	"requestModelChange":
						output = requestModelChange(user)
						socket.send(JSON.stringify({
							event: 'requestModelChange',
							output: output
						}))
						break

					case 'systemConfig':
						output = systemConfig()
						socket.send(JSON.stringify({
							event: 'systemConfig',
							output: output
						}))
						break

					case 'galleryImages':
						output = galleryImages(sid)
						socket.send(JSON.stringify({
							event: 'galleryImages',
							output: output
						}))
						break
					
					case 'generateImage':
						// close the file stream
						output= generateImage(sid)
						socket.send(JSON.stringify({
							event: 'generateImage',
							output: output
						}))

						break
					
					case 'progressUpdate':
						// close the file stream
						output= progressUpdate(sid)
						socket.send(JSON.stringify({
							event: 'progressUpdate',
							output: output
						}))
						break
					
					case 'intermediateResult':
						let output = intermediateResult(sid)
						socket.send(JSON.stringify({
							event: 'intermediateResult',
							output: output
						}))
						break
				}
			})
		})
	}
}

function startServer() {
	const app = express();
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(express.static('public'));

	const server = app.listen(9090, () => {
		console.log('Express app listening on port 9090!');
	});

	const httpTerminator = createHttpTerminator({ server })
//	server.close = function(callback){
//		httpTerminator.terminate()
//	}

	app.get('/socket.io', (req, res) => {
		//res.send('Hello World!');
		if (req.query.EIO == 4 && req.query.transport == 'polling' && req.query.t != null && req.query.sid == null){
			// convert the timestamp t to a hashed string named sid with length 20
			let sid = sha1(req.query.t).substring(0,20)
			let response = [{"sid":sid,"upgrades":["websocket"],"pingTimeout":60000,"pingInterval":100000}]
			res.send(response)
		}
		else if (req.query.EIO == 4 && req.query.transport == 'polling' && req.query.t != null && req.query.sid != null){
			let response = "OK"
			res.send(response)		
		}
		else if (req.query.EIO == 4 && req.query.transport == 'websocket' && req.query.sid != null){
			httpTerminator.terminate()
			killport(9090)
			// wait for the server to close
			while(Object.keys(server).includes("listening")){
				killport(9090)
				server.close()
				// free the port for the next server
				httpTerminator.terminate()
				// check the port again to see if it is free			
			}
			startWebsocket(true)
		}		
		// shut down the express server
	});
}



function main(){
	//let results = await startServer().then( (results, err ) => {
	//	if (err) {
	//		console.log(err)
	//	}
	//	else{
	//		startWebsocket(results)
	//	}
	//})

	let results = startServer()
}
let localstorage = {
    "generation": "{\"cfgScale\":7.5,\"height\":512,\"img2imgStrength\":0.75,\"infillMethod\":\"patchmatch\",\"iterations\":1,\"maskPath\":\"\",\"perlin\":0,\"prompt\":\"test\",\"negativePrompt\":\"\",\"sampler\":\"k_lms\",\"seamBlur\":16,\"seamless\":false,\"seamSize\":96,\"seamSteps\":30,\"seamStrength\":0.7,\"seed\":0,\"seedWeights\":\"\",\"shouldFitToWidthHeight\":true,\"shouldGenerateVariations\":false,\"shouldRandomizeSeed\":true,\"steps\":50,\"threshold\":0,\"tileSize\":32,\"variationAmount\":0.1,\"width\":512}",
    "postprocessing": "{\"codeformerFidelity\":0.75,\"facetoolStrength\":0.8,\"facetoolType\":\"gfpgan\",\"hiresFix\":false,\"hiresStrength\":0.75,\"shouldLoopback\":false,\"shouldRunESRGAN\":false,\"shouldRunFacetool\":false,\"upscalingLevel\":4,\"upscalingStrength\":0.75}",
    "gallery": "{\"shouldPinGallery\":true,\"shouldShowGallery\":true,\"galleryScrollPosition\":0,\"galleryImageMinimumWidth\":64,\"galleryImageObjectFit\":\"cover\",\"galleryWidth\":300,\"shouldUseSingleGalleryColumn\":false}",
    "system": "{\"log\":[],\"shouldShowLogViewer\":false,\"shouldDisplayInProgressType\":\"latents\",\"shouldDisplayGuides\":true,\"shouldConfirmOnDelete\":true,\"openAccordions\":[],\"currentStatusHasSteps\":false,\"model\":\"\",\"model_id\":\"\",\"model_hash\":\"\",\"app_id\":\"\",\"app_version\":\"\",\"model_list\":{},\"infill_methods\":[],\"hasError\":false,\"wasErrorSeen\":true,\"saveIntermediatesInterval\":5,\"enableImageDebugging\":false,\"toastQueue\":[],\"searchFolder\":null,\"foundModels\":null}",
    "canvas": "{\"boundingBoxCoordinates\":{\"x\":0,\"y\":0},\"boundingBoxDimensions\":{\"width\":512,\"height\":512},\"boundingBoxPreviewFill\":{\"r\":0,\"g\":0,\"b\":0,\"a\":0.5},\"boundingBoxScaleMethod\":\"auto\",\"brushColor\":{\"r\":90,\"g\":90,\"b\":255,\"a\":1},\"brushSize\":50,\"canvasContainerDimensions\":{\"width\":822,\"height\":1038},\"colorPickerColor\":{\"r\":90,\"g\":90,\"b\":255,\"a\":1},\"futureLayerStates\":[],\"isDrawing\":false,\"isMaskEnabled\":true,\"isMouseOverBoundingBox\":false,\"isMoveBoundingBoxKeyHeld\":false,\"isMoveStageKeyHeld\":false,\"isMovingBoundingBox\":false,\"isMovingStage\":false,\"isTransformingBoundingBox\":false,\"layer\":\"base\",\"layerState\":{\"objects\":[{\"kind\":\"line\",\"layer\":\"base\",\"tool\":\"brush\",\"strokeWidth\":25,\"points\":[980.0655736187446,5.639751622918425,980.0655736187446,5.639751622918425],\"color\":{\"r\":90,\"g\":90,\"b\":255,\"a\":1},\"clip\":{\"x\":0,\"y\":0,\"width\":512,\"height\":512}}],\"stagingArea\":{\"images\":[],\"selectedImageIndex\":-1}},\"maskColor\":{\"r\":255,\"g\":90,\"b\":90,\"a\":1},\"maxHistory\":128,\"minimumStageScale\":1,\"pastLayerStates\":[{\"objects\":[],\"stagingArea\":{\"images\":[],\"selectedImageIndex\":-1}}],\"scaledBoundingBoxDimensions\":{\"width\":512,\"height\":512},\"shouldAutoSave\":false,\"shouldCropToBoundingBoxOnSave\":false,\"shouldDarkenOutsideBoundingBox\":false,\"shouldLockBoundingBox\":false,\"shouldPreserveMaskedArea\":false,\"shouldRestrictStrokesToBox\":true,\"shouldShowBoundingBox\":true,\"shouldShowBrush\":true,\"shouldShowBrushPreview\":false,\"shouldShowCanvasDebugInfo\":false,\"shouldShowCheckboardTransparency\":false,\"shouldShowGrid\":true,\"shouldShowIntermediates\":true,\"shouldShowStagingImage\":true,\"shouldShowStagingOutline\":true,\"shouldSnapToGrid\":true,\"stageCoordinates\":{\"x\":155,\"y\":263},\"stageDimensions\":{\"width\":822,\"height\":1038},\"stageScale\":1,\"tool\":\"brush\"}",
    "ui": "{\"activeTab\":2,\"currentTheme\":\"dark\",\"parametersPanelScrollPosition\":0,\"shouldHoldParametersPanelOpen\":false,\"shouldPinParametersPanel\":true,\"shouldShowParametersPanel\":true,\"shouldShowDualDisplay\":true,\"shouldShowImageDetails\":false,\"shouldUseCanvasBetaLayout\":false,\"shouldShowExistingModelsInSearch\":false,\"addNewModelUIOption\":null}",
    "lightbox": "{\"isLightboxOpen\":false}",
    "_persist": "{\"version\":-1,\"rehydrated\":true}"
}
main()
//main().then(() => console.log('done'))
//setInterval(main, 1000)