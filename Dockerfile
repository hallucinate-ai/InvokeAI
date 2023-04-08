# For more information, please refer to https://aka.ms/vscode-docker-python
FROM nvidia/cuda:11.7.0-runtime-ubuntu22.04

ENV DEBIAN_FRONTEND=noninteractive
SHELL ["/bin/bash", "-c"]
RUN apt update
RUN apt install -y wget
RUN wget https://deb.nodesource.com/setup_19.x -O /tmp/nodejs.sh
RUN chmod +x /tmp/nodejs.sh
RUN /tmp/nodejs.sh
RUN apt-get update && \
    apt-get install -y nvidia-utils-510 libglib2.0-0 wget python3 python3-pip git curl ffmpeg libsm6 libxext6 nodejs&& \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Keeps Python from generating .pyc files in the container
ENV PYTHONDONTWRITEBYTECODE=1

# Turns off buffering for easier container logging
ENV PYTHONUNBUFFERED=1

#configure GIT
#RUN git config --global url."https://${GIT_ACCESS_TOKEN}@github.com".insteadOf "ssh://git@github.com"
#RUN git config --global user.name "${GIT_USER_NAME}"
#RUN git config --global user.email "${GIT_USER_EMAIL}"
# Install pip requirements

WORKDIR /app
RUN true
RUN echo "!hello!1"
RUN git clone https://github.com/hallucinate-ai/InvokeAI.git
WORKDIR /app/InvokeAI/invokeai/frontend/
RUN npm install . 
RUN npm i -g corepack
RUN yarn install
WORKDIR /app/InvokeAI/invokeai/newBackend/
RUN npm install .

# Creates a non-root user with an explicit UID and adds permission to access the /app folder
# For more info, please refer to https://aka.ms/vscode-docker-python-configure-containers
# During debugging, this entry point will be overridden. For more information, please refer to https://aka.ms/vscode-docker-python-debug
# CMD ["bash", "-c /app/worker/launcher.sh"]
ENTRYPOINT ["/app/InvokeAI/launcher.sh"]

