#!/bin/bash

cd ../React

npm run build

rm -r ../server/build

cp -r ./build ../server

cd ../server 

docker build --file=server.dockerfile --rm=true -t registry.heroku.com/messenger-snodgras4/web .

docker push registry.heroku.com/messenger-snodgras4/web

heroku container:release web -a messenger-snodgras4