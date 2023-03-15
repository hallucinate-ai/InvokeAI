
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
	let downloadList = modelList[2]
	for (let i = 0; i < Object.keys(downloadList).length; i++) {
		let model = Object.keys(downloadList)[i]
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
		console.log(cwd)
		console.log(results)
		cmd = "s3cmd --config=" + cwd + "/cw-object-storage-config_stable-diffusion ls s3://stable-diffusion-models/" + model + ".ckpt.done"
		results = await execSync(cmd)
		let done = results.toString()
		console.log(cwd)
		console.log(done)
		if (done.length == 0) {
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
		if(fs.existsSync(dst) && s3Filesize != downloadedFilesize && done.split("\n").length == 0){
			cmd = "s3cmd --config="+cwd+"/cw-object-storage-config_stable-diffusion put " + dst +" s3://stable-diffusion-models/"+ model + ".ckpt"
			results = await execSync(cmd)
			results = results.toString()
			console.log(cwd)
			console.log(results)
			cmd = "rm -rf " + dst + "/model.ckpt"
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
		else if (done.split("\n").length != 0){
			console.log("File already exists")
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


main().then((result) => {
	console.log(JSON.stringify(result));
	return true;
}); 
