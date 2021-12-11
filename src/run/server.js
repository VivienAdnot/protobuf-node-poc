const protobuf = require('protobufjs');
const express = require('express');
const path = require('path');

const app = express();

const run = async () => {
  // load proto
  const protoPath = path.resolve(__dirname, '../protos/user.proto');
  const root = await protobuf.load(protoPath);
  const User = root.lookupType('userpackage.User');

  // this is the object we send, or mutate
  const document = { firstname: 'Bill', age: 30 };

  app.get('/user', (req, res) => {
    // this retrieves the value of the object in memory
    const userEncoded = User.encode(document).finish();
    res.send(userEncoded);
  });

  app.post('/user', express.text({ type: '*/*' }), (req, res) => {
    // assume `req.body` contains the protobuf as a utf8-encoded string
    const userDecoded = User.decode(Buffer.from(req.body));

    // this mutates the value of the object in memory
    Object.assign(document, userDecoded);
    res.end();
  });

  await app.listen(3000);
}

run().catch(err => console.log(err));