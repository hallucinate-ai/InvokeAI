import axios from "axios";
import process from "process";
import { ChildProcess } from "child_process";
import { execSync } from "child_process";
import fs from "fs";
import { fileURLToPath } from "url";

function cachedModels() {
	let modelList = []
	let modelDict = {}
	let dir = process.cwd();
	let command = "s3cmd --config=/app/worker/cw-object-storage-config_stable-diffusion  ls s3://stable-diffusion-models/"
	let result = execSync(command, { cwd: dir });
	let lines = result.toString().split("\n");
	for(var i in lines){
		let line = lines[i]
		let fields = line.split("  ");
		if (fields.length > 1 && fields[1].includes("s3://stable-diffusion-models/") && fields[1].includes(".ckpt")){
			let modelName = fields[1]
			modelName = modelName.replace("s3://stable-diffusion-models/", "")
			modelList.push(modelName)
			modelDict[modelName.replace(".ckpt", "")] = modelName
		}
	}

	fs.writeFile(dir + "/cachedModelDict.json", JSON.stringify(modelList), (err) => {
		if (err) {
			console.log(err);
		}
	});

	return modelDict
}

export async function main() {
	let dir = process.cwd();
	let translatedModelDict = {}
	let translatedEnvDict = {}
	let downloadURLDict = {}
	let formattedModelNameDict = {}

	if(!fs.existsSync(dir + "/modelDict.json")){
		fs.writeFileSync(dir + "/modelDict.json", JSON.stringify({}))
	}
	// get the modified date of the cached model list
	let lastUpdated = fs.statSync(dir + "/cachedModelDict.json").mtime
	let currentTimestamp = new Date()
	let timeDiff = currentTimestamp.getTime() - lastUpdated.getTime()
	let twentyfourHours = 24 * 60 * 60 * 1000

	if (timeDiff > twentyfourHours){
		let endpoint = "https://civitai.com/api/v1/models";
		let queryParameters = { limit: 100, types: "Checkpoint", page: 1, sort: "Most Downloaded" };
		let allItems = [];
		let translatedModelDict = {};
		let translatedEnvDict = {};
		let downloadURLDict = {};
		let results
		let data
		let formattedModelNameDict = {}
		// send a get request to the endpoint with the query parameters
		// use try catch to handle errors
		try{
			results = await axios.get(endpoint, { params: queryParameters })
		}
		catch (error){
			console.log(error);
		}
		data = results.data
		let items = data["items"]
		let metadata = data["metadata"]


		allItems = allItems.concat(items)
		while ("nextPage" in metadata){
			try{
				results = await axios.get(metadata["nextPage"], { params: {} })
			}
			catch (error){
				console.log(error);
			}
			data = results.data
			items = data["items"]
			metadata = data["metadata"]
			allItems = allItems.concat(items)
		}
		//console.log("the number of models found is " + allItems.length)
		for (var i in allItems) {
			var item = allItems[i];
			var name = item["name"];
			let formattedModelName
			var formatName = name.replace(" ", "-");
			formatName = String(formatName).replace(/[^a-zA-Z0-9]/g, "-");
			//replace capital letters with lower case letters]
			formatName = formatName.toLowerCase();
			formatName = formatName.replace(/[^\x00-\x7F]/g, "");
			formatName = formatName.replace("(", "-")
			formatName = formatName.replace("'", "-")
			formatName = formatName.replace("'", "-")
			formatName = formatName.replace("/", "-")
			formatName = formatName.replace(")", "-")
			formatName = formatName.replace(":", "-")
			formatName = formatName.replace("_", "-")
			formatName = formatName.replace(".", "-")
			formatName = formatName.replace(",", "-")
			formatName = formatName.replace(" ", "-")
			//limit the length of the filename
			formatName = formatName.substr(0,31);
			var modelVersions = item["modelVersions"];
			// sort modelVersions by updatedAt most recent first using datetime
			modelVersions = modelVersions.sort(function(a,b){
				return new Date(b.updatedAt) - new Date(a.updatedAt);
			});

			for(var j in  modelVersions){
				let modelVersion = modelVersions[j]
				let versionName = modelVersion["name"]
				versionName = versionName.toLowerCase();
				versionName = versionName.replace(/[^\x00-\x7F]/g, "");
				versionName = versionName.replace("(", "-")
				versionName = versionName.replace("'", "-")
				versionName = versionName.replace("'", "-")
				versionName = versionName.replace("/", "-")
				versionName = versionName.replace(")", "-")
				versionName = versionName.replace(":", "-")
				versionName = versionName.replace("_", "-")
				versionName = versionName.replace(".", "-")
				versionName = versionName.replace(",", "-")
				versionName = versionName.replace(" ", "-")
				versionName = versionName.replace(" ", "-")
				let modelId = modelVersion["id"]
				let baseModel = modelVersion["baseModel"]
				let files = modelVersion["files"]
				let downloadUrl = modelVersion["downloadUrl"]
				let updatedAt = modelVersion["updatedAt"]
				for(var k in files){
					let file = files[k]
					let fileName = file["name"]
					let fileId = file["id"]
					let fileType = file["type"]
					let fileFormat = file["format"]
					let fileDownloadUrl = file["downloadUrl"]
					let virusScanResult = file["virusScanResult"]
					if(virusScanResult == "Success" && fileFormat == "PickleTensor" && fileType == "Model"){
						formattedModelName = "civitai-" + fileDownloadUrl.split("?")[0].split("/").pop().split(".")[0]
						let clipVersion
						if(baseModel == "SD 1.5" || baseModel == "SD 1.4"){
							clipVersion = "clip-vit-l14"
						}
						else{
							clipVersion = "clip-vit-h-14-laion2b-s32b-b79k"
						}
						let appendEnvList = {
							"MODEL_NAME" : formattedModelName,
							"WEIGHTS_CLIP" : clipVersion,
							"WEIGHTS_STABLE_DIFFUSION" : fileName
						}

						let downloadUrl = fileDownloadUrl

						let appendDict = {
							"repository": "endomorphosis/diffusionkit:" + formattedModelName,
							"defaultCheckpoint" : formattedModelName,
							"type": "img2img",
							"bytesPerPixel": 5120,
							"modelSpeed": 7,
							"baseResolution": [
								512,
								512
							],
							"minSize": 6442450944,
							"maxSize": 85899345920,
							"modelGPU": 1,
							"mx": 1,
							"b": 1,
							"minCuda": 11.7
						}
						// if name in formattedModelNameDict keys
						if (Object.keys(formattedModelNameDict).includes(name) == false){
							formattedModelNameDict[name] = {}
						}
						if (Object.keys(formattedModelNameDict[name]).includes(versionName) == false){
							formattedModelNameDict[name][versionName] = formattedModelName
						}

						translatedEnvDict[formattedModelName] = appendEnvList
						translatedModelDict[formattedModelName] = appendDict
						downloadURLDict[formattedModelName] = downloadUrl

					}
				}
			}
		}
		let models = cachedModels();
		for (var i = 0; i < models.length; i++) {
			let model = models[i];
			if (list(translatedModelDict.keys()).includes(model) == false) {
				let formatName = model.replace(" ", "-");
				//replace capital letters with lower case letters]
				formatName = formatName.toLowerCase();
				//replace the underscore with a dash
				formatName = String(formatName).replace(/[^a-zA-Z0-9]/g, "-");
				formatName = formatName.replace("(", "-")
				formatName = formatName.replace("'", "-")
				formatName = formatName.replace(",", "-")
				formatName = formatName.replace("'", "-")
				formatName = formatName.replace("/", "-")
				formatName = formatName.replace(")", "-")
				formatName = formatName.replace(":", "-")
				formatName = formatName.replace("_", "-")
				formatName = formatName.replace(".", "-")
				formatName = formatName.replace(" ", "-")
				//filter out non ascii characters
				formatName = formatName.replace(/[^\x00-\x7F]/g, "");
				//limit the length of the filename
				formatName = formatName.substr(0, 31);
				let clipVersion = "clip-vit-l14";
				let appendDict = {
					"repository": "endomorphosis/diffusionkit:" + formatName,
					"defaultCheckpoint" : formatName,
					"type": "img2img",
					"bytesPerPixel": 5120,
					"modelSpeed": 7,
					"baseResolution": [
						512,
						512
					],
					"minSize": 6442450944,
					"maxSize": 85899345920,
					"modelGPU": 1,
					"mx": 1,
					"b": 1,
					"minCuda": 11.7
				}
				let appendEnvList = {
					"MODEL_NAME" : formatName,
					"WEIGHTS_CLIP" : clipVersion,
					"WEIGHTS_STABLE_DIFFUSION" : "/app/checkpoints/"+ formatName + ".ckpt",
				}
				translatedEnvDict[formatName] = appendEnvList
				translatedModelDict[formatName] = appendDict
			}
		}
		fs.writeFileSync("modelDict.json", JSON.stringify([translatedModelDict, translatedEnvDict, downloadURLDict, formattedModelNameDict]))
		return([translatedModelDict, translatedEnvDict, downloadURLDict, formattedModelNameDict])
	}
	else{
		translatedModelDict = JSON.parse(fs.readFileSync("modelDict.json"))[0]
		translatedEnvDict = JSON.parse(fs.readFileSync("modelDict.json"))[1]
		downloadURLDict = JSON.parse(fs.readFileSync("modelDict.json"))[2]
		formattedModelNameDict = JSON.parse(fs.readFileSync("modelDict.json"))[3]
		return([translatedModelDict, translatedEnvDict, downloadURLDict, formattedModelNameDict])

	}
}

main().then((result) => {
	console.log(JSON.stringify(result));
});