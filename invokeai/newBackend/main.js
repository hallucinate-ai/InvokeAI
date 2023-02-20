import fs from 'fs'
import { resolve } from 'path'
import path from 'path'
import * as createWebSocket from "./createWebSocket.js"
import { spawn } from 'child_process'
import { exec } from 'child_process';
import * as child_process from "child_process";
import * as createServer from "./createServer.js"

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


async function startServer() {
    let dir = path.dirname(new URL(import.meta.url).pathname)
	//await execute('node', [ dir + '/createExpress.js'])
    createServer.startServer(9090)
}
startServer();