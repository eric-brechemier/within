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
               "properties must be shared in different parts of the module" );

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
    contextA,
    contextB,
    contextC,
    contextD,
    contextE,
    contextF,
    valuesA = [],
    valuesB = [],
    valuesC = [],
    valuesD = [],
    valuesE = [],
    valuesF = [],
    unsubscribeA,
    unsubscribeB,
    unsubscribeC,
    unsubscribeD,
    unsubscribeE,
    unsubscribeF;

  function observerA( value ) {
    contextA = this;
    valuesA.push( value );
  }

  function observerB( value ) {
    contextB = this;
    valuesB.push( value );
  }

  function observerC( value ) {
    contextC = this;
    valuesC.push( value );
  }

  function observerD( value ) {
    contextD = this;
    valuesD.push( value );
  }

  function observerE( value ) {
    contextE = this;
    valuesE.push( value );
  }

  function observerF( value ) {
    contextF = this;
    valuesF.push( value );
  }

  unsubscribeA = subscribe1( "missing", observerA );
  assert( valuesA.length === 0,  "no callback expected for missing property" );

  unsubscribeB = subscribe1( "one", observerB );
  assert(
    valuesB.length === 1 &&
    valuesB[ 0 ] === ONE &&
    contextB === module1 &&
    contextB.one === ONE,
                            "callback is expected to be called immediately " +
                                 "in the context of the module data object " +
                                              "when property is already set" );

  set1( "one", THREE );
  assert(
    valuesB.length === 1,
            "no callback is expected when a new value is set, not published" );

  publish1( "one", null );
  assert(
    valuesB.length === 2 &&
    valuesB[ 1 ] === null &&
    contextB === module1 &&
    contextB.one === null,
           "null value is expected to be published to registered observer " +
                                 "in the context of the module data object" );

  assert( get1( "one" ) === null,
                           "null value is expected to be set when published" );
  assert(
    get1( "one" ) === null &&
    get1too( "one" ) === null,
       "null value expected to be set in different parts of the same module" );

  unsubscribeC = subscribe1too( "one", observerC );
  assert(
    valuesC.length === 1 &&
    valuesC[ 0 ] === null &&
    contextC === module1,
                            "callback is expected to be called immediately " +
                                     "in the context of module data object " +
                                           "even when initial value is null" );

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
    valuesC.length === 2 &&
    valuesC[ 1 ] === ONE,
                                 "same notification expected for observers " +
                                    "in different parts of the same module" );

  assert(
    contextB === module1 &&
    contextC === module1,
                    "the same module data object is expected for observers " +
                                     "in different parts of the same module" );

  assert(
    get1( "one" ) === ONE &&
    get1too( "one" ) === ONE,
       "same value expected to be set in different parts of the same module " +
                                               "after an event is published" );

  publish1( "one", ONE );
  assert(
    valuesB.length === 4 &&
    valuesB[ 3 ] === ONE &&
    valuesC.length === 3 &&
    valuesC[ 2 ] === ONE,
                              "observers are expected to be notified again " +
                                     "even when the same value is published" );

  publish1too( "one" );
  assert( get1( "one" ) === true,
      "omitted value in publish is expected to be set as boolean value true" );

  assert(
    valuesB.length === 5 &&
    valuesB[ 4 ] === true &&
    valuesC.length === 4 &&
    valuesC[ 3 ] === true,
       "boolean value true is expected to be published when value is omitted");

  publish1too( "one", undefined );
  assert( get1( "one" ) === undefined,
                      "undefined value is expected to be set when published" );

  assert(
    valuesB.length === 6 &&
    valuesB[ 5 ] === undefined &&
    contextB === module1 &&
    valuesC.length === 5 &&
    valuesC[ 4 ] === undefined &&
    contextC === module1,
        "undefined value is expected to be published to registered listeners");

  subscribe1too( "one", observerC );
  assert(
    valuesC.length === 6 &&
    valuesC[ 5 ] === undefined &&
    contextC === module1,
                            "callback is expected to be called immediately " +
                                      "even when initial value is undefined" );

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

  var shortcut2 = within( MODULE2 );

  assert(
    typeof shortcut2 === "object" &&
    typeof shortcut2.get === "function" &&
    typeof shortcut2.set === "function" &&
    typeof shortcut2.publish === "function" &&
    typeof shortcut2.subscribe === "function",
            "a shortcut object with 4 methods get, set, publish, subscribe " +
             "is expected when calling within() without a callback function" );

  module2.ten = 10;
  assert(
    shortcut2.get( "ten" ) === 10,
         "shortcut get is expected to return the value of a module property" );

  shortcut2.set( "ten", 11 );
  assert(
    module2.ten === 11,
            "shortcut set is expected to set the value of a module property" );

  unsubscribeF = shortcut2.subscribe( "one", observerF );

  assert(
    typeof unsubscribeF === "function",
                       "shortcut subscribe is expected to return a function" );

  publish2( "one", "I" );

  assert(
    valuesE.length === 1 &&
    valuesE[ 0 ] === "I",
    contextE === module2 &&
    valuesF.length === 1 &&
    valuesF[ 0 ] === "I",
    contextF === module2,
        "listeners of second module are expected to be triggered by publish " +
                  "whether registered by subscribe or by shortcut subscribe" );

  shortcut2.publish( "one", "i" );

  assert(
    valuesE.length === 2 &&
    valuesE[ 1 ] === "i",
    contextE === module2 &&
    valuesF.length === 2 &&
    valuesF[ 1 ] === "i",
    contextF === module2,
    "shortcut publish is expected to trigger listeners of the module event " +
                 "whether registered by subscribe or by shortcut subscribe" );

  valuesA = [];
  valuesB = [];
  valuesC = [];
  valuesD = [];
  valuesE = [];
  valuesF = [];

  publish1( "four", FOUR );
  assert( get1( "four" ) === FOUR,
       "published value must be set (event without any registered listener)" );

  assert(
    valuesA.length === 0 &&
    valuesB.length === 0 &&
    valuesC.length === 0 &&
    valuesD.length === 0 &&
    valuesE.length === 0 &&
    valuesF.length === 0,
                                              "no other listener must fire " +
                "when an event is published without any registered listener" );

  unsubscribeA();
  unsubscribeB();
  unsubscribeC();
  unsubscribeD();
  unsubscribeE();
  unsubscribeF();

  publish1( "missing", "The end" );
  publish1( "one", TWO );
  publish1too( "one", THREE );
  publish1( "two", ONE );
  publish2( "one", TWO );
  shortcut2.publish( "one", THREE );

  assert(
    valuesA.length === 0 &&
    valuesB.length === 0 &&
    valuesC.length === 0 &&
    valuesD.length === 0 &&
    valuesE.length === 0 &&
    valuesF.length === 0,
                                              "no other listener must fire " +
                "after corresponding unsubscribe() function has been called" );

}) );
