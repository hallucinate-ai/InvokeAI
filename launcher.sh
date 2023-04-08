#!/bin/sh

# change current working directory to frontend
cd /app/InvokeAI/invokeai/frontend
cwd = $(pwd)
echo $cwd
npm run dev -- --host &
	
trap killall INT TERM EXIT
wait
