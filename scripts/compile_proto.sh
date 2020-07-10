#!/bin/bash

protoc -I proto xudrpc.proto annotations.proto google/api/http.proto google/protobuf/descriptor.proto \
--plugin=protoc-gen-grpc-web=./node_modules/.bin/protoc-gen-grpc-web \
--js_out=import_style=commonjs,binary:src/proto \
--grpc-web_out=import_style=commonjs+dts,mode=grpcwebtext:src/proto

for f in src/proto/*.js src/proto/google/api/*.js src/proto/google/protobuf/*.js; do
  sed -i.bak '1i\
/* eslint-disable */\
' $f
  head -n1 $f
  rm -f $f.bak
done
