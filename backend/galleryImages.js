import fs from 'fs'
export function main(type, mtime, token, socket){
	let user = token
	console.log("retrieve gallery images")
	console.log("token: " + token)
	if(token){
		user = token
	}
	let images = []
	if(!fs.existsSync('./gallery/' + user + '/')){
		fs.mkdirSync('./gallery/' + user + '/')
	}

	if(!fs.existsSync('./gallery/' + user + '/metadata.json')){
		let metadata = {}
		fs.writeFileSync('./gallery/' + user + '/metadata.json', JSON.stringify(metadata))
	}

	let category = ""
	let files = fs.readdirSync('./gallery/' + user + '/')
	let metadata = fs.readFileSync('./gallery/' + user + '/metadata.json')
	metadata = JSON.parse(metadata)
	files.forEach(file => {
		if(!file.endsWith('.json') && !file.match("thumbnail")){
			let thisMetadata = {}
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
				thisMetadata = metadataTemplate
			}
			else{
				thisMetadata = metadata[file];
			}
			category = "result"
			if(file.match("uploaded")){
				category = "user"
			}
			let thisImage = thisMetadata["image"]
			let imageTemplate = {
					"url": "outputs/" + user + "/" + file,
					"thumbnail": "outputs/" + user + "/" + file.replace(".png", "-thumbnail.png"),
					"mtime": fs.statSync('./gallery/' + user + '/' + file).mtimeMs,
					"metadata": thisMetadata,
					"dreamPrompt": "\"" + thisImage["prompt"][0]["prompt"] +"\" -s "+ thisImage["steps"] + " -S "+ thisImage["seed"] + " -W " + thisImage["width"] + "-H "+ thisImage["height"] +" -C " + thisImage["cfg_scale"] + " -A " + thisImage["sampler"],
					"width": thisImage["width"],
					"height": thisImage["height"],
					"category": category
				}

			if(type == "user" && file.match("uploaded")){
				images.push(imageTemplate)
			}
			else if(type == "result" && !file.match("uploaded")){
				images.push(imageTemplate)
			}
		}
	})
	let output = {
		"images": images,
		"areMoreImagesAvailable": true,
		"category": type
	}
	return output
}