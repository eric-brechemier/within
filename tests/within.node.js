// Run tests with nodejs: node within.node.js

require("../within");

var assert = require("assert");
global.assert = function( condition, message ) {
  assert( condition === true, message );
};

global.log = function( message ) {
  console.log( message );
};

// from sub/nada/tests/test.js (CC0)
global.test = function test( func ) {
  try {
    func();
    return "SUCCESS";
  } catch( e ) {
    return "ERROR: " + e.message;
  }
};

require("./within.test");

