#!/bin/sh

cd /app/InvokeAI/invokeai/newBackend
node main.js &
cd /app/InvokeAI/invokeai/frontend
node run dev -- --host &
