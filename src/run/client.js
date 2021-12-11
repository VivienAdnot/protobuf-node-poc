const protobuf = require('protobufjs');
const axios = require('axios');
const assert = require('assert').strict;
const path = require('path');

const run = async () => {
  // load proto
  const protoPath = path.resolve(__dirname, '../protos/user.proto');
  const root = await protobuf.load(protoPath);
  const User = root.lookupType('userpackage.User');

  // fetch origin user
  const { data: originUser } = await axios.get('http://localhost:3000/user');
  const originUserDecoded = User.decode(Buffer.from(originUser));
  assert.equal(originUserDecoded.firstname, 'Bill');
  assert.equal(originUserDecoded.age, 30);
  console.log('origin', originUserDecoded);

  // mutates user
  const postBody = User.encode({
    firstname: 'Joe',
    lastname: 'Dalton',
    age: 27
  }).finish();
  await axios.post('http://localhost:3000/user', postBody);

  // fetch new user
  const { data: newUser } = await axios.get('http://localhost:3000/user');
  const newUserDecoded = User.decode(Buffer.from(newUser));
  console.log('new', newUserDecoded);
  assert.equal(newUserDecoded.firstname, 'Joe');
  assert.equal(newUserDecoded.lastname, 'Dalton');
  assert.equal(newUserDecoded.age, 27);
}

run().catch(err => console.log(err));