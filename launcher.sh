#!/bin/sh

cd /app/InvokeAI/invokeai/newBackend
node main.js &
# change current working directory to frontend
cd /app/InvokeAI/invokeai/frontend
cwd = $(pwd)
echo $cwd
npm run dev -- --host &

trap killall INT TERM EXIT
wait
