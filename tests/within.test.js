log( test(function() {

  var
    PATH = "within.js.org/tests/",
    SPACE1 = PATH + "space1",
    SPACE2 = PATH + "space2",
    SPACE1_VALUE1 = 'space1-value1',
    SPACE1_VALUE2 = 'space1-value2',
    SPACE2_VALUE = 'space2-value',
    SPACE0_VALUE = 'space0-value',
    result,
    space1,
    space1too,
    space2,
    space2too,
    spaceFunction2,
    anonymousFunction0,
    space0too,
    anonymousFunction00,
    publish1,
    publish1too,
    publish2,
    publish2too,
    publish0too,
    subscribe1,
    subscribe1too,
    subscribe2,
    subscribe2too,
    subscribe0too,
    get1,
    get1too,
    get2,
    get2too,
    get0too,
    set1,
    set1too,
    set2,
    set2too,
    set0too;

  assert( typeof within === "function",
                                "within is expected to be a global function");

  result = within( SPACE1, function( publish, subscribe, get, set ) {
    space1 = this;
    publish1 = publish;
    subscribe1 = subscribe;
    get1 = get;
    set1 = set;
    return SPACE1_VALUE1;
  });

  assert( result === SPACE1_VALUE1,
                                    "within( name, callback ) must return " +
                                     "the same value as the callback (1/2)" );

  result = within( SPACE1, function( publish, subscribe, get, set ) {
    space1too = this;
    publish1too = publish;
    subscribe1too = subscribe;
    get1too = get;
    set1too = set;
    return SPACE1_VALUE2;
  });

  assert( result === SPACE1_VALUE2,
                                    "within( name, callback ) must return " +
                                     "the same value as the callback (2/2)" );

  result = within( SPACE2, function( publish, subscribe, get, set ) {
    space2 = this;
    publish2 = publish;
    subscribe2 = subscribe;
    get2 = get;
    set2 = set;
  });

  assert ( result === undefined,
                           "within( name, callback ) must return undefined " +
                               "when the callback does not return any value" );

  assert(
    typeof space1 === "object" &&
    typeof space1too === "object" &&
    typeof space2 === "object",
                        "an object is expected as context for the callback" );

  assert(
    typeof publish1 === "function" &&
    typeof subscribe1 === "function" &&
    typeof get1 === "function" &&
    typeof set1 === "function" &&
    typeof publish1too === "function" &&
    typeof subscribe1too === "function" &&
    typeof get1too === "function" &&
    typeof set1too === "function" &&
    typeof publish2 === "function" &&
    typeof subscribe2 === "function" &&
    typeof get2 === "function" &&
    typeof set2 === "function",
          "all four arguments of the callback are expected to be functions" );

  assert( space1 === space1too,
                    "the same context object is expected for the same name" );

  assert( space2 !== space1,
               "a different context object is expected for different names" );

  var
    HAS_OWN_PROPERTY = "my own property?",
    ZERO = [],
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
    space1.one === ONE &&
    space1.two === TWO &&
    space1.three === THREE,
                   "values set to properties must be set to context object" );

  assert(
    get1too( "one" ) === ONE &&
    get1too( "two" ) === TWO &&
    get1too( "three" ) === THREE,
               "properties must be shared in different parts of the space" );

  assert(
    get2( "one" ) === undefined &&
    get2( "two" ) === undefined &&
    get2( "three" ) === undefined,
                         "properties must not be shared with other spaces" );

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
    contextG,
    contextH,
    contextI,
    contextJ,
    contextK,
    contextL,
    valuesA = [],
    valuesB = [],
    valuesC = [],
    valuesD = [],
    valuesE = [],
    valuesF = [],
    valuesG = [],
    valuesH = [],
    valuesI = [],
    valuesJ = [],
    valuesK = [],
    valuesL = [],
    unsubscribeA,
    unsubscribeB,
    unsubscribeC,
    unsubscribeD,
    unsubscribeE,
    unsubscribeF,
    unsubscribeG,
    unsubscribeH,
    unsubscribeI,
    unsubscribeJ,
    unsubscribeK,
    unsubscribeL;

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

  function observerG( value ) {
    contextG = this;
    valuesG.push( value );
  }

  function observerH( value ) {
    contextH = this;
    valuesH.push( value );
  }

  function observerI( value ) {
    contextI = this;
    valuesI.push( value );
  }

  function observerJ( value ) {
    contextJ = this;
    valuesJ.push( value );
  }

  function observerK( value ) {
    contextK = this;
    valuesK.push( value );
  }

  function observerL( value ) {
    contextL = this;
    valuesL.push( value );
  }

  unsubscribeA = subscribe1( "missing", observerA );
  assert( valuesA.length === 0,  "no callback expected for missing property" );

  unsubscribeB = subscribe1( "one", observerB );
  assert(
    valuesB.length === 1 &&
    valuesB[ 0 ] === ONE &&
    contextB === space1 &&
    contextB.one === ONE,
                            "callback is expected to be called immediately " +
                                 "in the context of the space data object " +
                                              "when property is already set" );

  unsubscribeK = subscribe1( "one", observerK, false );
  assert( valuesK.length === 0,
                                  "callback must not be called immediately " +
                                             "when property is already set " +
                                       "but `now` parameter is set to false" );

  unsubscribeL = subscribe1( "one", observerL, true );
  assert(
    valuesL.length === 1 &&
    valuesL[ 0 ] === ONE &&
    contextL === space1 &&
    contextL.one === ONE,
                            "callback is expected to be called immediately " +
                                  "in the context of the space data object " +
                                              "when property is already set" +
                                        "and `now` parameter is set to true" );

  set1( "one", THREE );
  assert(
    valuesB.length === 1 &&
    valuesK.length === 0 &&
    valuesL.length === 1,
            "no callback is expected when a new value is set, not published" );

  publish1( "one", null );
  assert(
    valuesB.length === 2 &&
    valuesK.length === 1 &&
    valuesL.length === 2 &&
    valuesB[ 1 ] === null &&
    valuesK[ 0 ] === null &&
    valuesL[ 1 ] === null &&
    contextB === space1 &&
    contextK === space1 &&
    contextL === space1 &&
    contextB.one === null,
           "null value is expected to be published to registered observer " +
                                 "in the context of the space data object" );

  assert( get1( "one" ) === null,
                           "null value is expected to be set when published" );
  assert(
    get1( "one" ) === null &&
    get1too( "one" ) === null,
       "null value expected to be set in different parts of the same space" );

  unsubscribeC = subscribe1too( "one", observerC );
  assert(
    valuesC.length === 1 &&
    valuesC[ 0 ] === null &&
    contextC === space1,
                            "callback is expected to be called immediately " +
                                     "in the context of space data object " +
                                           "even when initial value is null" );

  assert(
    valuesB.length === 2 &&
    valuesK.length === 1 &&
    valuesL.length === 2,
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
                                    "in different parts of the same space" );

  assert(
    contextB === space1 &&
    contextC === space1,
                    "the same space data object is expected for observers " +
                                     "in different parts of the same space" );

  assert(
    get1( "one" ) === ONE &&
    get1too( "one" ) === ONE,
       "same value expected to be set in different parts of the same space " +
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
    contextB === space1 &&
    valuesC.length === 5 &&
    valuesC[ 4 ] === undefined &&
    contextC === space1,
        "undefined value is expected to be published to registered listeners");

  subscribe1too( "one", observerC );
  assert(
    valuesC.length === 6 &&
    valuesC[ 5 ] === undefined &&
    contextC === space1,
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
     "no notification expected for observer of another event in same space" );

  assert(
    valuesE.length === 0,
     "no notification expected for observer of same event in another space" );

  spaceFunction2 = within( SPACE2 );

  assert(
    typeof spaceFunction2 === "function" &&
    typeof spaceFunction2.get === "function" &&
    typeof spaceFunction2.set === "function" &&
    typeof spaceFunction2.publish === "function" &&
    typeof spaceFunction2.subscribe === "function",
             "a space function with 4 methods publish, subscribe, get, set " +
             "is expected when calling within() without a callback function" );

  result = spaceFunction2( function( publish, subscribe, get, set ) {
    space2too = this;
    publish2too = publish;
    subscribe2too = subscribe;
    get2too = get;
    set2too = set;
    return SPACE2_VALUE;
  });

  assert( result === SPACE2_VALUE,
              "space function must return the value of the callback, if any" );

  assert( space2too === space2,
      "The same space data object is expected in callback of space function" );

  assert(
    typeof publish2too === "function" &&
    typeof subscribe2too === "function" &&
    typeof get2too === "function" &&
    typeof set2too === "function",
          "4 functions expected as parameters of callback of space function" );

  space2.ten = 10;
  assert(
    spaceFunction2.get( "ten" ) === 10,
         "shortcut get is expected to return the value of a space property" );

  assert(
    get2too( "ten" ) === 10,
    "same result expected in get() parameter of callback of space function" );

  spaceFunction2.set( "ten", 11 );
  assert(
    space2.ten === 11,
            "shortcut set is expected to set the value of a space property" );

  set2too( "ten", 12 );
  assert(
    space2.ten === 12,
                            "set() parameter of callback of space function " +
                      "expected to set the value of property in space data" );

  unsubscribeF = spaceFunction2.subscribe( "one", observerF );
  unsubscribeG = subscribe2too( "one", observerG );

  assert(
    typeof unsubscribeF === "function",
                       "shortcut subscribe is expected to return a function" );

  assert(
    typeof unsubscribeG === "function",
                      "subscribe() function of callback of space function " +
                                         "is expected to return a function" );

  publish2( "one", "I" );

  assert(
    valuesE.length === 1 &&
    valuesE[ 0 ] === "I" &&
    contextE === space2 &&
    valuesF.length === 1 &&
    valuesF[ 0 ] === "I" &&
    contextF === space2 &&
    valuesG.length === 1 &&
    valuesG[ 0 ] === "I" &&
    contextG === space2,
        "listeners of second space are expected to be triggered by publish " +
                                                    "whether registered by " +
                        "subscribe of callback of within( name, callback ) " +
                                       "subscribe method of space function " +
                                "or subscribe of callback of space function" );

  spaceFunction2.publish( "one", "i" );

  assert(
    valuesE.length === 2 &&
    valuesE[ 1 ] === "i" &&
    contextE === space2 &&
    valuesF.length === 2 &&
    valuesF[ 1 ] === "i" &&
    contextF === space2 &&
    valuesG.length === 2 &&
    valuesG[ 1 ] === "i" &&
    contextG === space2,
    "shortcut publish is expected to trigger listeners of the space event " +
                                                   "whether registered by " +
                      "subscribe callback of within or of space function, " +
                                 "or by subscribe method of space function" );

  publish2too( "one", "|" );
  assert(
    valuesE.length === 3 &&
    valuesE[ 2 ] === "|" &&
    contextE === space2 &&
    valuesF.length === 3 &&
    valuesF[ 2 ] === "|" &&
    contextF === space2 &&
    valuesG.length === 3 &&
    valuesG[ 2 ] === "|" &&
    contextG === space2,
                                   "publish of callback of space function " +
                     "is expected to trigger listeners of the space event " +
                                                   "whether registered by " +
                      "subscribe callback of within or of space function, " +
                                 "or by subscribe method of space function" );

  anonymousFunction0 = within();
  anonymousFunction00 = within();

  assert(
    typeof anonymousFunction0 === "function" &&
    typeof anonymousFunction0.publish === "function" &&
    typeof anonymousFunction0.subscribe === "function" &&
    typeof anonymousFunction0.get === "function" &&
    typeof anonymousFunction0.set === "function" &&
    typeof anonymousFunction00 === "function" &&
    typeof anonymousFunction00.publish === "function" &&
    typeof anonymousFunction00.subscribe === "function" &&
    typeof anonymousFunction00.get === "function" &&
    typeof anonymousFunction00.set === "function",
             "a space function with 4 methods publish, subscribe, get, set " +
                   "is expected when calling within() without any parameter" );

  result = anonymousFunction0( function( publish, subscribe, get, set ) {
    space0too = this;
    publish0too = publish;
    subscribe0too = subscribe;
    get0too = get;
    set0too = set;
    return SPACE0_VALUE;
  });

  assert(
    result === SPACE0_VALUE,
    "result value of callback must be returned by anonymous space function" );

  assert(
    typeof publish0too === "function" &&
    typeof subscribe0too === "function" &&
    typeof get0too === "function" &&
    typeof set0too === "function",
                           "4 functions expected as parameters of callback " +
                                               "of anonymous space function" );

  assert(
    anonymousFunction0.get( "zero" ) === undefined &&
    anonymousFunction0.get( "one" ) === undefined &&
    anonymousFunction0.get( "two" ) === undefined &&
    anonymousFunction0.get( "three" ) === undefined &&
    anonymousFunction0.get( "four" ) === undefined &&
    anonymousFunction0.get( "ten" ) === undefined &&
    get0too( "zero" ) === undefined &&
    get0too( "one" ) === undefined &&
    get0too( "two" ) === undefined &&
    get0too( "three" ) === undefined &&
    get0too( "four" ) === undefined &&
    get0too( "ten" ) === undefined &&
    anonymousFunction00.get( "zero" ) === undefined &&
    anonymousFunction00.get( "one" ) === undefined &&
    anonymousFunction00.get( "two" ) === undefined &&
    anonymousFunction00.get( "three" ) === undefined &&
    anonymousFunction00.get( "four" ) === undefined &&
    anonymousFunction00.get( "ten" ) === undefined,
                                        "get() method of anonymous spaces " +
                 " is expected to return undefined before a property is set" );

  anonymousFunction0.set( "zero", ZERO );

  assert(
    space0too.zero === ZERO,
       "set() method of anonymous space " +
       "is expected to set value in the shared data of the anonymous space" );

  assert(
    anonymousFunction0.get( "zero" ) === ZERO &&
    get0too( "zero" ) === ZERO,
                                        "get method of anonymous space and " +
                    "get parameter of callback of anonymous space function " +
                                  "are expected to return the value set by " +
                                           "set() method of anonymous space" );

  set0too( "one", ONE );

  assert(
    space0too.one === ONE,
                  "set() parameter of callback of anonymous space function" +
       "is expected to set value in the shared data of the anonymous space" );

  assert(
    anonymousFunction0.get( "one" ) === ONE &&
    get0too( "one" ) === ONE,
                                        "get method of anonymous space and " +
                    "get parameter of callback of anonymous space function " +
                                  "are expected to return the value set by " +
                   "set() parameter of callback of anonymous space function" );

  assert(
    anonymousFunction00.get( "zero" ) === undefined &&
    anonymousFunction00.get( "one" ) === undefined,
                    "values set in an anonymous space must not be shared " +
                                             "with other anonymous spaces" );

  unsubscribeH = anonymousFunction0.subscribe( "zero", observerH );
  unsubscribeI = anonymousFunction00.subscribe( "zero", observerI );

  assert(
    typeof unsubscribeH === "function" &&
    typeof unsubscribeI === "function",
             "subscribe method of anonymous spaces must return a function" );

  assert(
    contextH === space0too &&
    valuesH.length === 1 &&
    valuesH[ 0 ] === ZERO,
                                                 "listener registered with " +
                                      "subscribe method of anonymous space " +
                                  "is expected to be triggered immediately " +
                        "in the context of the anonymous space data object " +
                            "when the corresponding property is already set" );

  publish0too( "zero", 0 );

  assert(
    contextH === space0too &&
    valuesH.length === 2 &&
    valuesH[ 1 ] === 0,
            "listener registered with subscribe method of anonymous space " +
                                                "is expected to fire when " +
               "publish parameter of callback of anonymous space is called" );

  assert(
    contextI === undefined &&
    valuesI.length === 0,
              "a listener for the same property in another anonymous space " +
                                  "is not expected to get triggered however" );

  anonymousFunction00.publish( "zero", 0 );
  assert(
    typeof contextI === "object" &&
    contextI.zero === 0 &&
    valuesI.length === 1 &&
    valuesI[ 0 ] === 0,
                  "listener is expected to fire when an event is published " +
                                                     "in an anonymous space" );

  unsubscribeJ = subscribe0too( "two", observerJ );

  assert( valuesJ.length === 0,
                            "listener registered with subscribe parameter " +
                                 "of callback of anonymous space function " +
                  "is not expected to trigger when the property is not set" );

  anonymousFunction0.publish( "two", TWO );

  assert(
    contextJ === space0too &&
    valuesJ.length === 1 &&
    valuesJ[ 0 ] === TWO,
                            "listener registered with subscribe parameter " +
                                 "of callback of anonymous space function " +
                                             "is expected to trigger when " +
                           "publish method of anonymous function is called" );

  publish0too( "two", 2 );

  assert(
    contextJ === space0too &&
    valuesJ.length === 2 &&
    valuesJ[ 1 ] === 2,
                            "listener registered with subscribe parameter " +
                                 "of callback of anonymous space function " +
                                             "is expected to trigger when " +
            "publish parameter of callback of anonymous function is called" );

  assert(
    contextI !== contextA &&
    contextI !== contextB &&
    contextI !== contextC &&
    contextI !== contextD &&
    contextI !== contextE &&
    contextI !== contextF &&
    contextI !== contextG &&
    contextI !== contextH,
             "anonymous spaces are expected to have unique context objects " +
   "different from the context of named spaces and other anonymous spaces" );

  valuesA = [];
  valuesB = [];
  valuesC = [];
  valuesD = [];
  valuesE = [];
  valuesF = [];
  valuesG = [];
  valuesH = [];
  valuesI = [];
  valuesJ = [];
  valuesK = [];
  valuesL = [];

  publish1( "four", FOUR );
  assert( get1( "four" ) === FOUR,
       "published value must be set (event without any registered listener)" );

  assert(
    valuesA.length === 0 &&
    valuesB.length === 0 &&
    valuesC.length === 0 &&
    valuesD.length === 0 &&
    valuesE.length === 0 &&
    valuesF.length === 0 &&
    valuesG.length === 0 &&
    valuesH.length === 0 &&
    valuesI.length === 0 &&
    valuesJ.length === 0 &&
    valuesK.length === 0 &&
    valuesL.length === 0,
                                              "no other listener must fire " +
                "when an event is published without any registered listener" );

  unsubscribeA();
  unsubscribeB();
  unsubscribeC();
  unsubscribeD();
  unsubscribeE();
  unsubscribeF();
  unsubscribeG();
  unsubscribeH();
  unsubscribeI();
  unsubscribeJ();
  unsubscribeK();
  unsubscribeL();

  publish1( "missing", "The end" );
  publish1( "one", TWO );
  publish1too( "one", THREE );
  publish1( "two", ONE );
  publish2( "one", TWO );
  spaceFunction2.publish( "one", THREE );
  publish2too( "one", FOUR );
  anonymousFunction0.publish( "zero", ONE );
  anonymousFunction00.publish( "zero", TWO );
  publish0too( "two", ZERO );

  assert(
    valuesA.length === 0 &&
    valuesB.length === 0 &&
    valuesC.length === 0 &&
    valuesD.length === 0 &&
    valuesE.length === 0 &&
    valuesF.length === 0 &&
    valuesG.length === 0 &&
    valuesH.length === 0 &&
    valuesI.length === 0 &&
    valuesJ.length === 0 &&
    valuesK.length === 0 &&
    valuesL.length === 0,
                                              "no other listener must fire " +
                "after corresponding unsubscribe() function has been called" );

  assert( typeof within('within.js.org').get('version') === 'string',
             "A string property is expected for the version of the library." );

}) );
