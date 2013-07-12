log( test(function() {

  var
    PATH = "github.com/eric-brechemier/within/tests/",
    MODULE1 = PATH + "module1",
    MODULE2 = PATH + "module2",
    module1,
    module1too,
    module2,
    get1,
    get1too,
    get2,
    set1,
    set1too,
    set2,
    publish1,
    publish1too,
    publish2,
    subscribe1,
    subscribe1too,
    subscribe2;

  assert( typeof within === "function",
                                "within is expected to be a global function");

  within( MODULE1, function( get, set, publish, subscribe ) {
    module1 = this;
    get1 = get;
    set1 = set;
    publish1 = publish;
    subscribe1 = subscribe;
  });

  within( MODULE1, function( get, set, publish, subscribe ) {
    module1too = this;
    get1too = get;
    set1too = set;
    publish1too = publish;
    subscribe1too = subscribe;
  });

  within( MODULE2, function( get, set, publish, subscribe ) {
    module2 = this;
    get2 = get;
    set2 = set;
    publish2 = publish;
    subscribe2 = subscribe;
  });

  assert(
    typeof module1 === "object" &&
    typeof module1too === "object" &&
    typeof module2 === "object",
                        "an object is expected as context for the callback" );

  assert(
    typeof get1 === "function" &&
    typeof set1 === "function" &&
    typeof publish1 === "function" &&
    typeof subscribe1 === "function" &&
    typeof get1too === "function" &&
    typeof set1too === "function" &&
    typeof publish1too === "function" &&
    typeof subscribe1too === "function" &&
    typeof get2 === "function" &&
    typeof set2 === "function" &&
    typeof publish2 === "function" &&
    typeof subscribe2 === "function",
          "all four arguments of the callback are expected to be functions" );

  assert( module1 === module1too,
                    "the same context object is expected for the same name" );

  assert( module2 !== module1,
               "a different context object is expected for different names" );

  var
    HAS_OWN_PROPERTY = "my own property?",
    ONE = 1,
    TWO = "TWO",
    THREE = {
      three: /3/
    },
    FOUR = [ 1, 2, 3, 4 ];

  assert(
    get1( "one" ) === undefined,
    "get is expected to return undefined initially before a property is set" );

  set1( "one", ONE );
  set1( "two", TWO );
  set1( "three", THREE );

  assert(
    get1( "one" ) === ONE &&
    get1( "two" ) === TWO &&
    get1( "three" ) === THREE,
                         "values set to properties must be returned by get" );

  assert(
    module1.one === ONE &&
    module1.two === TWO &&
    module1.three === THREE,
                   "values set to properties must be set to context object" );

  assert(
    get1too( "one" ) === ONE &&
    get1too( "two" ) === TWO &&
    get1too( "three" ) === THREE,
                   "properties must be shared with instances of the module" );

  assert(
    get2( "one" ) === undefined &&
    get2( "two" ) === undefined &&
    get2( "three" ) === undefined,
                         "properties must not be shared with other modules" );

  assert(
    get1( "hasOwnProperty" ) === undefined,
                            "inherited values must not be returned by get" );

  set1( "hasOwnProperty", HAS_OWN_PROPERTY );
  assert(
    get1( "hasOwnProperty" ) === HAS_OWN_PROPERTY,
       "own values of inherited properties must be set and returned by get" );

  var
    valuesA = [],
    valuesB = [],
    valuesC = [],
    valuesD = [],
    valuesE = [],
    unsubscribeA,
    unsubscribeB,
    unsubscribeC,
    unsubscribeD,
    unsubscribeE;

  function observerA( value ) {
    valuesA.push( value );
  }

  function observerB( value ) {
    valuesB.push( value );
  }

  function observerC( value ) {
    valuesC.push( value );
  }

  function observerD( value ) {
    valuesD.push( value );
  }

  function observerE( value ) {
    valuesE.push( value );
  }

  unsubscribeA = subscribe1( "missing", observerA );
  assert( valuesA.length === 0,  "no callback expected for missing property" );

  unsubscribeB = subscribe1( "one", observerB );
  assert(
    valuesB.length === 1 &&
    valuesB[ 0 ] === ONE,
                            "callback is expected to be called immediately " +
                                              "when property is already set" );

  set1( "one", THREE );
  assert(
    valuesB.length === 1,
            "no callback is expected when a new value is set, not published" );

  publish1( "one", null );
  assert(
    valuesB.length === 2 &&
    valuesB[ 1 ] === null,
             "null value is expected to be published to registered observer" );

  assert( get1( "one" ) === null,
                           "null value is expected to be set when published" );
  assert(
    get1( "one" ) === null &&
    get1too( "one" ) === null,
  "null value expected to be set in different instances of the same module" );

  unsubscribeC = subscribe1too( "one", observerC );
  assert(
    valuesC.length === 0,
                        "callback is not expected to be called immediately " +
                                                "when initial value is null" );

  assert(
    valuesB.length === 2,
                     "other observers are not expected to be notified again" );

  unsubscribeD = subscribe1( "two", observerD );
  unsubscribeE = subscribe2( "one", observerE );
  valuesD = [];
  valuesE = [];

  publish1( "one", ONE );
  assert(
    valuesB.length === 3 &&
    valuesB[ 2 ] === ONE &&
    valuesC.length === 1 &&
    valuesC[ 0 ] === ONE,
                                 "same notification expected for observers " +
                                "in different instances of the same module" );
  assert(
    get1( "one" ) === ONE &&
    get1too( "one" ) === ONE,
  "same value expected to be set in different instances of the same module " +
                                               "after an event is published" );

  publish1( "one", ONE );
  assert(
    valuesB.length === 4 &&
    valuesB[ 3 ] === ONE &&
    valuesC.length === 2 &&
    valuesC[ 1 ] === ONE,
                              "observers are expected to be notified again " +
                                     "even when the same value is published" );

  publish1too( "one" );
  assert( get1( "one" ) === undefined,
              "omitted value in publish is expected to be set as undefined" );

  assert(
    valuesB.length === 5 &&
    valuesB[ 4 ] === undefined &&
    valuesC.length === 3 &&
    valuesC[ 2 ] === undefined,
         "undefined value is expected to be published when value is omitted");

  subscribe1too( "one", observerC );
  assert(
    valuesC.length === 3,
                        "callback is not expected to be called immediately " +
                                          "when initial value is undefined" );

  valuesC = [];
  publish1too( "one", ONE );

  assert(
    valuesC.length === 2 &&
    valuesC[ 0 ] === ONE &&
    valuesC[ 1 ] === ONE,
                   "observers registered multiple times for the same event " +
                        "are expected to be triggered multiple times as well");

  assert(
    valuesD.length === 0,
     "no notification expected for observer of another event in same module" );

  assert(
    valuesE.length === 0,
     "no notification expected for observer of same event in another module" );

  valuesA = [];
  valuesB = [];
  valuesC = [];
  valuesD = [];
  valuesE = [];

  publish1( "four", FOUR );
  assert( get1( "four" ) === FOUR,
       "published value must be set (event without any registered listener)" );

  assert(
    valuesA.length === 0 &&
    valuesB.length === 0 &&
    valuesC.length === 0 &&
    valuesD.length === 0 &&
    valuesE.length === 0,
                                              "no other listener must fire " +
                "when an event is published without any registered listener" );

  unsubscribeA();
  unsubscribeB();
  unsubscribeC();
  unsubscribeD();
  unsubscribeE();

  publish1( "missing", "The end" );
  publish1( "one", TWO );
  publish1too( "one", THREE );
  publish1( "two", ONE );
  publish2( "one", TWO );

  assert(
    valuesA.length === 0 &&
    valuesB.length === 0 &&
    valuesC.length === 0 &&
    valuesD.length === 0 &&
    valuesE.length === 0,
                                              "no other listener must fire " +
                "after corresponding unsubscribe() function has been called" );

}) );
