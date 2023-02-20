function main(user){
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