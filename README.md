within
======
https://github.com/eric-brechemier/within

within is a factory of semi-private spaces  
where properties and events can be shared.

API
---

  Function: within( name, callback )  
  Create a semi-private space to share properties and events

  This function allows to create modules that span multiple source
  files before concatenation.

    // module1-part1.js
    within( "example.org/module1", function( get, set, publish, subscribe ) {
      // definition of module 1, part 1
    });

    // module1-part2.js
    within( "example.org/module1", function( get, set, publish, subscribe ) {
      // definition of module 1, part 2
    });

    // module1-part3.js
    within( "example.org/module1", function( get, set, publish, subscribe ) {
      // definition of module 1, part 3
    });

  A module is identified by a name which starts with a domain and a path
  that correspond to a space where you would be able to post contents
  on the Web (although you don't have to). The intent is to avoid clashes
  with modules defined by different people and organizations, or even
  yourself in the future:

    example.tld/hypothetic/path/to/module

  The callback function runs immediately, within the context of an object
  that holds data for the module; the same object is provided in all parts
  of the module.

  Four functions are provided as arguments to the callback to interact with
  data and publish events within the confines of this shared symbolic space.

  The get() and set() functions simply get and set properties in the data
  object, without publishing any event. Since the data object can also be
  accessed as 'this' in the callback function, properties can also be set
  and retrieved directly.

  The advantage of get() over direct access through 'this' is that it only
  retrieves the value of own properties stored directly in the data object,
  and not the value of properties inherited from the Object prototype chain,
  which allows to use the data object as a hash, without tripping on
  [special names such as 'constructor' or 'hasOwnProperty'][OBJECT_PROTOTYPE].

  [OBJECT_PROTOTYPE]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/prototype

  A disadvantage of get() compared with direct access through 'this' is
  that it does not provide any means to differentiate between an unset value
  and a value explicitly set to null. In both cases, get() returns null:

    set( "property1", null );
    get( "property1" ) === null; // true

    // property2 has never been set
    get( "property2" ) === null; // true

  get() only returns 'undefined' if the value 'undefined' is set explicitly:

    set( "property3", undefined );
    get( "property3" ) === undefined; // true

  But this feature can also be seen as an advantage, and results from a
  deliberate design decision, to make the data object behave more like a hash
  and allow a stronger comparison of result value with '===' operator instead
  of a weaker comparison using '==' operator which results in type coercion.

  There is no particular advantage of set() compared with directly setting
  a value through 'this', except that the set() function remains accessible
  in all functions defined within the callback function provided as argument
  to within(), unlike 'this' which varies as the calling context of each
  function changes:

    within( "example.org/module1", function( get, set, publish, subscribe ){

      // 'this' refers to module data
      // get() and set() allow to get/set properties in module data

      function innerFunction() {
        // 'this' no longer refers to module data
        // get() and set() still allow to get/set properties in module data
      }

      innerFunction();
    });

  The publish() function broadcasts to listeners registered with subscribe()
  the value of an event. A common use case is to call publish() twice in a row,
  with a verb in the active form and the same verb in passive form:

    publish( "start", get( "config" ) );
    publish( "started" );

  This allows to define two types of listeners for the event, listeners
  for "start" which process provided data in turn and listeners for "started"
  which get notified once the processing completes:

    subscribe( "start", function( config ) {
      // configure some behavior using provided configuration
    });

    subscribe( "started", function() {
      // start using the configured behavior
    });

  The value of the event is also set to the property of the same name:

    subscribe( "start", function( config ) {
      // get( "config" ) === config; // true
    });

  If no value is provided, it defaults to the boolean value true:

    subscribe( "started", function() {
      // start using the configured behavior
    });

  When a listener is registered for an event while the property of the same
  name has already been set, subscribe() fires the listener immediately
  without waiting for the next call to publish():

    subscribe( "started", function( value ) {
      // called immediately with the current value of the property:
      // get( "started" ) === true;
    });

  As a side effect, this is also the case when the property has only been
  set and never published before:

    // no call to publish( "score" ) before
    set( "score", 42 );

    subscribe( "score", function( score ){
      // called immediately with the current value of the score
      // get( "score" ) === score; // true
    });

LANGUAGE
---------

  JavaScript  

AUTHOR
------

  Eric Bréchemier  
  http://eric.brechemier.name

LICENSE
-------

  CC0 - No Copyright  
  https://creativecommons.org/publicdomain/zero/1.0/

