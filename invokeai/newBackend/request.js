
	const  HallucinateAPI = new WebSocket('wss://api.hallucinate.app?version=7.0')
	//const send = task2 => ws.send(JSON.stringify(task2))
	const send = task => HallucinateAPI.send(JSON.stringify(task))

	HallucinateAPI.on('open', () => {
		let expectedBytes
		
		console.log('connection accepted')
		
		HallucinateAPI.on('message', raw => {
			let { event, ...payload } = JSON.parse(raw)
	
			switch (event) {
				case 'queue':
					console.log('position in queue is:', payload.position)
					break
				
				case 'progress':
					console.log(
						'progress:', 
						payload.stage, 
						payload.value
							? `${Math.round(payload.value * 100)}%`
							: ``
					)
					break
	
				case 'error':
					console.log('error:', payload.message)
					break
	
				case 'result':
					if (fs.existsSync('output.jpg'))
						fs.unlinkSync('output.jpg')
	
					expectedBytes = payload.length
					console.log('compute finished: expecting', expectedBytes, 'bytes')
					break
	
				case 'chunk':
					let blob = Buffer.from(payload.blob, 'base64')
	
					fs.appendFileSync('output.jpg', blob)
					expectedBytes -= blob.length
	
					console.log('received bytes:', expectedBytes, 'to go')
	
					if(expectedBytes <= 0){
						console.log('done')
						process.exit()
					}
	
					break
	
			}
		})
	
		if(context){
			send({
				command: 'upload_image',
				id: 'ctx',
				blob: context.toString('base64')
			})
			console.log('sent context')
		}
	
		if(mask){
			send({
				command: 'upload_image',
				id: 'mask',
				blob: mask.toString('base64')
			})
			console.log('sent mask')
		}
	
	
		send({
			...task,
			command: 'diffuse',
			id: 'task',
			input_image: context ? 'ctx' : undefined,
			mask_image: mask ? 'mask' : undefined,
		})
	
		console.log('sent task:', task)
	})
	
	HallucinateAPI.on('close', code => {
		console.log('socket closed: code', code)
	})