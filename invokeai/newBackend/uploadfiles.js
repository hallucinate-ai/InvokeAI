
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
		dst = dst +  model + ".ckpt"
		cmd = "wget -q -O " + dst + " " + src
		results = await execSync(cmd)
		results = results.toString()
		console.log(cwd)
		console.log(results)
		let downloadedFilesize = fs.statSync(dst).size
		console.log("s3Filesize: " + s3Filesize)
		console.log("downloadedFilesize: " + downloadedFilesize)
		if(fs.existsSync(dst) && s3Filesize != downloadedFilesize){
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
		}
		else{
			console.log("File already exists")
		}
	}
}


main().then((result) => {
	console.log(JSON.stringify(result));
	return true;
}); 
