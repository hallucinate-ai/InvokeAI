
import axios from "axios";
import process from "process";
import { ChildProcess } from "child_process";
import { execSync } from "child_process";
import fs from "fs";
import { fileURLToPath } from "url";

async function main() {
	let cwd = process.cwd();
	let cmd = ""
	let results = ""
	//let modelcheck = execSync("getModelList.js").toString()
	let modelList = fs.readFileSync(cwd + "/modelDict.json", "utf8")
	modelList = JSON.parse(modelList)
	let filteredModels = fs.readFileSync(cwd + "/filterdmodelDict.json", "utf8")
	filteredModels = JSON.parse(filteredModels)
	let downloadList = modelList[2]
	let listlength = Object.keys(downloadList).length
	let downloadlistKeys = Object.keys(downloadList)
	for (let i = 0; i < Object.keys(filteredModels).length; i++) {
		let model = filteredModels[Object.keys(filteredModels)[i]]["modelid"]
		if (downloadlistKeys.includes(model) != false) {
			let modelURL = downloadList[model]
			let src = modelURL
			let downloadedFilesize = 0
			let dst = "/tmp/models/"
			if (!fs.existsSync(dst)) {
				fs.mkdirSync(dst)
			}
			cmd = "s3cmd --config=" + cwd + "/cw-object-storage-config_stable-diffusion ls s3://stable-diffusion-models/" + model + ".ckpt"
			results = await execSync(cmd)
			results = results.toString()
			let s3Filesize = results.split(" ")[2]
			console.log(cmd)
			console.log(results)
			cmd = "s3cmd --config=" + cwd + "/cw-object-storage-config_stable-diffusion ls s3://stable-diffusion-models/" + model + ".ckpt.done"
			results = await execSync(cmd)
			let done = results.toString()
			console.log(cmd)
			console.log(done)
			if (done.length == 0) {
				console.log(model + " is not in s3")
				dst = dst +  model + ".ckpt"
				cmd = "wget -q -O " + dst + " " + src
				results = await execSync(cmd)
				results = results.toString()
				console.log(cwd)
				console.log(results)
				downloadedFilesize = fs.statSync(dst).size
				console.log("s3Filesize: " + s3Filesize)
				console.log("downloadedFilesize: " + downloadedFilesize)
			}
			else{
				console.log("File already downloaded")
			}
			if(fs.existsSync(dst) && s3Filesize != downloadedFilesize && done.length == 0){
				console.log("File is not in s3 or is not the same size")
				cmd = "s3cmd --config="+cwd+"/cw-object-storage-config_stable-diffusion put " + dst +" s3://stable-diffusion-models/"+ model + ".ckpt"
				results = await execSync(cmd)
				results = results.toString()
				console.log(cwd)
				console.log(results)
				cmd = "rm -rf " + dst 
				results = await execSync(cmd)
				results = results.toString()
				console.log(cwd)
				console.log(results)
				cmd = "touch " + dst + ".done"
				results = await execSync(cmd)
				results = results.toString()
				console.log(cwd)
				cmd = "s3cmd --config="+cwd+"/cw-object-storage-config_stable-diffusion put " + dst +".done s3://stable-diffusion-models/"+ model + ".ckpt.done"
				results = await execSync(cmd)
				results = results.toString()
				console.log(cwd)
				console.log(results)
			}
			else if (done.length != 0){
				console.log("File already exists in s3")
				cmd = "touch " + dst + ".done"
				results = await execSync(cmd)
				results = results.toString()
				console.log(cwd)
				cmd = "s3cmd --config="+cwd+"/cw-object-storage-config_stable-diffusion put " + dst +".done s3://stable-diffusion-models/"+ model + ".ckpt.done"
				results = await execSync(cmd)
				results = results.toString()
				console.log(cwd)
				console.log(results)
			}
		}
	}
}


main().then((result) => {
	console.log(JSON.stringify(result));
	return true;
}); 
