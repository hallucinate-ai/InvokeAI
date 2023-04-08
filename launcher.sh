#!/bin/sh

cd invokeai/newBackend
node main.js &
cd ../../
cd invokeai/frontend
node run dev -- --host &
