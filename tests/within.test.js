log( test(function() {

  var
    PATH = "github.com/eric-brechemier/within/tests/",
    SPACE1 = PATH + "space1",
    SPACE2 = PATH + "space2",
    space1,
    space1too,
    space2,
    spaceFunction2,
    anonymous0,
    anonymous00,
    publish1,
    publish1too,
    publish2,
    subscribe1,
    subscribe1too,
    subscribe2,
    get1,
    get1too,
    get2,
    set1,
    set1too,
    set2;

  assert( typeof within === "function",
                                "within is expected to be a global function");

  within( SPACE1, function( publish, subscribe, get, set ) {
    space1 = this;
    publish1 = publish;
    subscribe1 = subscribe;
    get1 = get;
    set1 = set;
  });

  within( SPACE1, function( publish, subscribe, get, set ) {
    space1too = this;
    publish1too = publish;
    subscribe1too = subscribe;
    get1too = get;
    set1too = set;
  });

  within( SPACE2, function( publish, subscribe, get, set ) {
    space2 = this;
    publish2 = publish;
    subscribe2 = subscribe;
    get2 = get;
    set2 = set;
  });

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
    valuesA = [],
    valuesB = [],
    valuesC = [],
    valuesD = [],
    valuesE = [],
    valuesF = [],
    valuesG = [],
    valuesH = [],
    unsubscribeA,
    unsubscribeB,
    unsubscribeC,
    unsubscribeD,
    unsubscribeE,
    unsubscribeF,
    unsubscribeG,
    unsubscribeH;

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

  set1( "one", THREE );
  assert(
    valuesB.length === 1,
            "no callback is expected when a new value is set, not published" );

  publish1( "one", null );
  assert(
    valuesB.length === 2 &&
    valuesB[ 1 ] === null &&
    contextB === space1 &&
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

  space2.ten = 10;
  assert(
    spaceFunction2.get( "ten" ) === 10,
         "shortcut get is expected to return the value of a space property" );

  spaceFunction2.set( "ten", 11 );
  assert(
    space2.ten === 11,
            "shortcut set is expected to set the value of a space property" );

  unsubscribeF = spaceFunction2.subscribe( "one", observerF );

  assert(
    typeof unsubscribeF === "function",
                       "shortcut subscribe is expected to return a function" );

  publish2( "one", "I" );

  assert(
    valuesE.length === 1 &&
    valuesE[ 0 ] === "I",
    contextE === space2 &&
    valuesF.length === 1 &&
    valuesF[ 0 ] === "I",
    contextF === space2,
        "listeners of second space are expected to be triggered by publish " +
                  "whether registered by subscribe or by shortcut subscribe" );

  spaceFunction2.publish( "one", "i" );

  assert(
    valuesE.length === 2 &&
    valuesE[ 1 ] === "i",
    contextE === space2 &&
    valuesF.length === 2 &&
    valuesF[ 1 ] === "i",
    contextF === space2,
    "shortcut publish is expected to trigger listeners of the space event " +
                 "whether registered by subscribe or by shortcut subscribe" );

  anonymous0 = within();
  anonymous00 = within();

  assert(
    typeof anonymous0 === "function" &&
    typeof anonymous0.publish === "function" &&
    typeof anonymous0.subscribe === "function" &&
    typeof anonymous0.get === "function" &&
    typeof anonymous0.set === "function" &&
    typeof anonymous00 === "function" &&
    typeof anonymous00.publish === "function" &&
    typeof anonymous00.subscribe === "function" &&
    typeof anonymous00.get === "function" &&
    typeof anonymous00.set === "function",
             "a space function with 4 methods publish, subscribe, get, set " +
                   "is expected when calling within() without any parameter" );

  assert(
    anonymous0.get( "zero" ) === undefined &&
    anonymous0.get( "one" ) === undefined &&
    anonymous0.get( "two" ) === undefined &&
    anonymous0.get( "three" ) === undefined &&
    anonymous0.get( "four" ) === undefined &&
    anonymous0.get( "ten" ) === undefined &&
    anonymous00.get( "zero" ) === undefined &&
    anonymous00.get( "one" ) === undefined &&
    anonymous00.get( "two" ) === undefined &&
    anonymous00.get( "three" ) === undefined &&
    anonymous00.get( "four" ) === undefined &&
    anonymous00.get( "ten" ) === undefined,
                                        "get() method of anonymous spaces " +
                 " is expected to return undefined before a property is set" );

  anonymous0.set( "zero", ZERO );

  assert(
    anonymous0.get( "zero" ) === ZERO &&
    anonymous00.get( "zero" ) === undefined,
       "a value set in an anonymous space must be set only in this space " +
                              "and not shared with other anonymous spaces" );

  unsubscribeG = anonymous0.subscribe( "zero", observerG );
  unsubscribeH = anonymous00.subscribe( "zero", observerH );

  assert(
    typeof unsubscribeG === "function" &&
    typeof unsubscribeH === "function",
             "subscribe method of anonymous spaces must return a function" );

  assert(
    typeof contextG === "object" &&
    valuesG.length === 1 &&
    valuesG[ 0 ] === ZERO,
   "listener is expected to be triggered immediately in anonymous subscribe " +
                            "when the corresponding property is already set" );

  assert(
    contextH === undefined &&
    valuesH.length === 0,
              "a listener for the same property in another anonymous space " +
                                  "is not expected to get triggered however" );

  anonymous00.publish( "zero", 0 );
  assert(
    typeof contextH === "object" &&
    valuesH.length === 1 &&
    valuesH[ 0 ] === 0,
                  "listener is expected to fire when an event is published " +
                                                   "in an anonymous space" );

  assert(
    valuesG.length === 1,
                "a listener for the same event in another anonymous space " +
                                          "is not expected to fire however" );

  assert(
    contextG.zero === ZERO &&
    contextH.zero === 0,
                             "properties are expected to be set in context " +
                                   "provided as this to anonymous listener" );

  assert(
    contextG !== contextA &&
    contextG !== contextB &&
    contextG !== contextC &&
    contextG !== contextD &&
    contextG !== contextE &&
    contextG !== contextF &&
    contextH !== contextA &&
    contextH !== contextB &&
    contextH !== contextC &&
    contextH !== contextD &&
    contextH !== contextE &&
    contextH !== contextF,
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
    valuesH.length === 0,
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

  publish1( "missing", "The end" );
  publish1( "one", TWO );
  publish1too( "one", THREE );
  publish1( "two", ONE );
  publish2( "one", TWO );
  spaceFunction2.publish( "one", THREE );
  anonymous0.publish( "two", FOUR );
  anonymous00.publish( "four", TWO );

  assert(
    valuesA.length === 0 &&
    valuesB.length === 0 &&
    valuesC.length === 0 &&
    valuesD.length === 0 &&
    valuesE.length === 0 &&
    valuesF.length === 0 &&
    valuesG.length === 0 &&
    valuesH.length === 0,
                                              "no other listener must fire " +
                "after corresponding unsubscribe() function has been called" );

}) );
