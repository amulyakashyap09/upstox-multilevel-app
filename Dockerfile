FROM nikolaik/python-nodejs:latest

# Set environment variable
ENV NODE_ENV=development
ENV MONGODB=mongodb://mongodb:27017/upstox
ENV PORT=7000
ENV HOST=127.0.0.1

COPY ./package.json /tmp/package.json

# RUN npm install pm2@latest -g
RUN cd /tmp && npm install
RUN mkdir -p /home/code && cp -a /tmp/node_modules /home/code

WORKDIR /home/code

ADD . /home/code/

COPY ./package.json /home/code/package.json

EXPOSE 7000

RUN chmod +x ./wait.sh

CMD [ "./wait.sh" ]
