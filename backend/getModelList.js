import axios from "axios";
import process from "process";
import { ChildProcess } from "child_process";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
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


function modelList(timestamp, task, context, socket){
	
}

export function main(){
	// make websocket request to api.hallucinate.app and get the image
	console.log("ModelList")
	// generate a random id for the image
	let results = undefined
	let id = Math.floor(Math.random() * 1000000000)
	let cwd = process.cwd()
	let timestamp = Date.now()
	//let dir = path.dirname(new URL(import.meta.url).pathname)	let timestamp = Date.now()
	let context = ""
	let task = {}
	task = {
		"command": "list_models",
		"id": id
	}
	console.log("ModelList called")
	var output = {}
	var HallucinateAPI = new WebSocket('wss://api.hallucinate.app')
	const send = payload => HallucinateAPI.send(JSON.stringify(payload))

	HallucinateAPI.on('open', () => {
		let expectedBytes
		
		console.log('connection accepted')
		HallucinateAPI.on('message', raw => {
			let { event, ...payload } = JSON.parse(raw)
	
			switch (event) {
				case 'error':
					console.log('error:', payload.message)
					break
	
				case 'models':
					console.log(payload.models)
					fs.writeFileSync(cwd + '/models.json', JSON.stringify(payload.models))
					return payload.models
					break
				}
			})
	
		send({
			...task,			
		})
	
		console.log('sent ModelList  task:', task)
	})

	HallucinateAPI.on('close', code => {
		console.log('socket closed: code', code)
	})
}

