import fs from 'fs'
import { resolve } from 'path'
import express from 'express';
import bodyParser from 'body-parser';
import sha1 from 'sha1';
import { createHttpTerminator } from 'http-terminator';
import killport from 'kill-port';
 

function startServer() {
	const app = express();
	app.use(bodyParser.json());
	app.use(bodyParser.urlencoded({ extended: true }));
	app.use(express.static('public'));

	const server = app.listen(9091, () => {
		console.log('Express app listening on port 9091!');
	});

	const httpTerminator = createHttpTerminator({ server })

	app.get('/outputs', (req, res) => {

	});

	app.get('/upload', (req, res) => {

	});


	app.get('/flaskwebgui-keep-server-alive', (req, res) => {
		res.send()
	});

}


startServer();