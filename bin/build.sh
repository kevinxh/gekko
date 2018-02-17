#!/bin/sh

if [ -z "$PORT" ]
then
  PORT=3000;
  echo $PORT;
fi
sed -i "s/process.env.PORT/$PORT/g" ./web/vue/UIconfig.js
sed -i "s/ssl: false/ssl: true/g" ./web/vue/UIconfig.js