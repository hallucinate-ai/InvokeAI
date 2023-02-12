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
			// create session ID
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
			//startWebsocket(true)
		}		
		// shut down the express server
	});
}


startServer();