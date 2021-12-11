const protobuf = require('protobufjs');
const assert = require('assert').strict;
const path = require('path');

const run = async () => {
  // load proto
  const protoPath = path.resolve(__dirname, '../protos/user.proto');
  const root = await protobuf.load(protoPath);
  const User = root.lookupType('userpackage.User');

  // verification
  assert.equal(User.verify({ firstname: 'test', age: 2 }), null);

  // required validations:
  try {
    assert.equal(User.verify({ propertyDoesntExist: 'test' }), null);
  } catch (err) {
    assert.equal(err.actual, 'firstname: string expected');
  }

  try {
    assert.equal(User.verify({ age: 10 }), null);
  } catch (err) {
    assert.equal(err.actual, 'firstname: string expected');
  }

  // type validation:
  try {
    assert.equal(User.verify({ firstname: 'test', age: 'not a number' }), null);
  } catch (err) {
    assert.equal(err.actual, 'age: integer expected');
  }

  // encode objects
  const userBuffer = User.encode({ firstname: 'Bill', age: 30 }).finish();
  assert.equal(Buffer.isBuffer(userBuffer), true);
  const utf8String = userBuffer.toString('utf8');
  // utf8String contains Bill but is not strictly equal to it
  assert.equal(utf8String.includes('Bill'), true);
  assert.equal(userBuffer.toString('hex'), '0a0442696c6c101e');

  // decode objects
  const userDecoded = User.decode(userBuffer);
  assert.equal(userDecoded.firstname, 'Bill');
  assert.equal(userDecoded.age, 30);
}

run().catch(err => console.log(err));