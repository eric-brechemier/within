within
======
https://github.com/eric-brechemier/within

within is a factory of semi-private spaces  
where events and properties can be shared  
in isolation.

API
---

Function: `within( name, callback )`  
Create a semi-private space to share events and properties

Both name and callback can be omitted, resulting in three different forms
described in the sections below.

  * [`within( name, callback ): any` - run code in the space with given name]
    [WITHIN2]
  * [`within( name ): function` - access the space with given name]
    [WITHIN1]
  * [`within(): function` - create an anonymous space]
    [WITHIN0]

[WITHIN2]: #within2
[WITHIN1]: #within1
[WITHIN0]: #within0

### <a name="within2">`within( name, callback ): any`</a> ###

Run the given callback in the space with given name and return the result
of the callback (left as undefined if missing).

This form allows to create modules that span multiple source files
before concatenation.

    // module1-part1.js
    within( "example.org/module1", function( publish, subscribe, get, set ) {
      // definition of module 1, part 1
    });

    // module1-part2.js
    within( "example.org/module1", function( publish, subscribe, get, set ) {
      // definition of module 1, part 2
    });

    // module1-part3.js
    within( "example.org/module1", function( publish, subscribe, get, set ) {
      // definition of module 1, part 3
    });

A module is identified by a domain name and a path forming the module name
which roughly corresponds to a space where you would be able to publish
contents on the Web (although you don't have to):

    "example.tld/hypothetic/path/to/module"

The intent is to avoid clashes with modules defined by different people and
organizations, or even yourself in the future.

The callback function runs immediately, within the context of an object
that holds data for the module; the same object is provided in all parts
of the module:

    within( "example.org/module1", function( publish, subscribe, get, set ) {
      // 'this' refers to semi-private module data
    });

Four functions are provided as arguments to the callback to interact with
the space, publish and subscribe to events and share data within the confines
of this shared symbolic space:

* `publish( name[, value] )` - set the value of a property and publish an event
* `subscribe( name, listener[, now])` - subscribe to an event
* `get( name[, callback] )` - get the value of a property in space data
* `set( name, value )` - set the value of a property in space data

The `publish()` function notifies registered listeners of the occurrence of
an event in the module together with the current value of the associated
property. A common use case is to call `publish()` twice in a row,
with a verb in the active form and the same verb in passive form:

    publish( "start", {
      // configuration properties
    });
    publish( "started" );

Listeners for `"start"` may process provided data in turn while listeners
for `"started"` will get notified once the processing completes:

    subscribe( "start", function( config ) {
      // configure some behavior using provided properties
    });

    subscribe( "started", function() {
      // start using the configured behavior
    });

The value of the event is also set to the property of the same name:

    subscribe( "start", function( config ) {
      // get( "start" ) === config; // true
    });

When no value is provided in the call to `publish()`, it defaults to the
boolean value `true`:

    publish( "started" );

    subscribe( "started", function() {
      // get( "started" ) === true; // true
      // start using the configured behavior
    });

The `subscribe()` function registers a subscription for the current and
next values of a property. When a listener is registered while the property
has already been set, `subscribe()` fires the listener immediately
without waiting for the next call to `publish()`:

    publish( "score", 0 );

    subscribe( "score", function( score ) {
      // called immediately with the current score
      // and each time a new "score" event is published
    });

The return value of `subscribe()` is a function that can be called
to cancel the subscription at any time:

    var unsubscribeFromScore = subscribe( "score", function ( score ) {

      if ( score === 100 ) {
        publish( "winner", get( "name" ) );
        unsubscribeFromScore();
      }
    });

It is also possible to set up a one-time subscription by calling `get()`
with a callback:

    get( "winner", function( winner ){
      // congratulate winner
    });

This is equivalent to:

    var unsubscribeFromWinner = subscribe( "winner", function( winner ) {
      unsubscribeFromWinner();
      // congratulate winner
    });

Note that it is also the case when the property has only been set
and never published before:

    // no call to publish( "started" ) before
    set( "started", true );

    subscribe( "started", function( value ) {
      // called immediately with the current value of the property:
      // get( "started" ) === true;
    });

This default behavior can be avoided by setting the optional third
parameter `now` to `false` in the call to `subscribe()`:

    publish( "redraw" );

    subscribe( "redraw", function() {
      // subscription starts with next 'redraw' event
    }, false);

For convenience, `this` also refers to the space data object in listeners
for events of the module:

    subscribe( "start", function() {
      // 'this' refers to the module data
      this.score = 0;

      publish( "started" );
    });

    get( "started", function() {
      // 'this' refers to the module data
      publish( "start-score", this.score );
    });

The `get()` and `set()` functions simply get and set properties in the space
data, without publishing any event. Since the data object can also be
accessed as `this` in the callback function, properties can also be set
and retrieved directly:

    within( "example.org/module1", function( publish, subscribe, get, set ) {
      // 'this' refers to semi-private space data
      this.property = 'value';

      // equivalent to:
      set('property', 'value');

      // two ways to get the value
      get('property') === this.property; // true
    });

The advantage of `get()` over direct access through `this` is that it only
retrieves the value of *own* properties stored directly in the data object,
and not the value of properties *inherited* from the Object prototype chain,
which allows to use the data object as a hash, without tripping on
[special names such as 'constructor' or 'hasOwnProperty'][OBJECT_PROTOTYPE]:

    within( "example.org/module1", function( publish, subscribe, get, set ) {
      // 'constructor' is inherited from Object prototype
      typeof this.constructor === 'function'; // true

      // inherited properties are ignored by get()
      typeof get('constructor') === 'function'; // false
    });

[OBJECT_PROTOTYPE]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/prototype

The advantage of `set()` compared with directly setting a value through `this`
is that the `set()` function remains accessible in all functions defined
within the callback function provided as argument to `within()`, unlike `this`
which varies as the calling context of each function changes:

    within( "example.org/module1", function( publish, subscribe, get, set ){

      // 'this' refers to space data
      // get() and set() allow to get/set properties in space data

      function innerFunction() {
        // 'this' no longer refers to space data
        // get() and set() still allow to get/set properties in space data
      }

      innerFunction();
    });

### <a name="within1">`within( name ): function`</a> ###

Access the space with given name.

The space function can be called to run code in the space.
It returns the result of the callback, if any:

    var space = within( "example.org/module1" );

    // run code in the space "example.org/module1"
    var value = space(function( publish, subscribe, get, set ) {
      var result;
      ...
      return result;
    });

which is equivalent to:

    // run code in the space "example.org/module1"
    var value = within( "example.org/module1", function( pub, sub, get, set ) {
      var result;
      ...
      return result;
    });

The space has four methods which are the same functions provided as
parameters to the callback: `publish`, `subscribe`, `get`, `set`.

This is a shortcut intended for use in debugging:

    console.log( within( "example.org/game" ).get( "score" ) );
    within( "example.org/game" ).set( "score", 0 );
    within( "example.org/game" ).subscribe( "bonus", function( bonus ){
      console.log( bonus );
    });
    within( "example.org/game" ).publish( "bonus", 100 );

The above form is more redundant but easier to type in the console,
due to reduced indentation level compared with the equivalent form below:

    within( "example.org/game", function( publish, subscribe, get, set ){
      console.log( get( "score" ) );
      set( "score", 0 );
      subscribe( "bonus", function( bonus ){
        console.log( bonus );
      });
      publish( "bonus", 100 );
    });

The shorter form is also useful when interacting with a space from within
another space:

    within( "example.org/test", function( publish, subscribe, get, set ){

      var game = within( "example.org/game" );

      game.subscribe( "bonus", function( bonus ){
        var score = game.get( "score" );
        game.set( "score", score + bonus );
      });

      game.publish( "bonus", 100 );

    });

The short form above is more readable due to reduced nesting, and less
confusing than the longer form below which uses the same function names
`publish`, `subscribe`, `get`, `set` for the methods of two different spaces:

    within( "example.org/test", function( publish, subscribe, get, set ){
      // publish, subscribe, get, set are methods of space "example.org/test"

      within( "example.org/game", function( publish, subscribe, get, set ){
        // publish, subscribe, get, set are methods of "example.org/game"

        subscribe( "bonus", function( bonus ){
          var score = get( "score" );
          set( "score", score + bonus );
        });

        publish( "bonus", 100 );
      });

    });

### <a name="within0">`within(): function`</a>  ###

Create an anonymous space.

The anonymous space function can be called to run code within,
and has the four methods `publish`, `subscribe`, `get` and `set`
to interact with the space directly.

    var space = within();

    // run code in the anonymous space
    var value = space(function( publish, subscribe, get, set ) {
      var result;
      ...
      return result;
    });

    // interact with the space directly
    space.set('property', 'value');
    var value = space.get('property');
    space.publish('property', value);
    space.subscribe('property', function(value){ ... });

Each call to within() without any argument results in the creation of a
different anonymous space, for single use:

    // 3 separate anonymous spaces,
    // with separate events and properties
    var space1 = within(); // a first anonymous space
    var space2 = within(); // a second anonymous space
    var space3 = within(); // a third anonymous space

No reference is kept in the factory for any anonymous space.

References to named spaces on the other hand are preserved for the lifetime
of the application, unless you delete references to these spaces yourself
from the two hashes `'data'` and `'subscribers` of `'within.js.org'`.
If you want to manage this cache separately, you can use anonymous spaces
instead, which are forgotten as soon as they are out of the factory.

An anonymous space can be created for each instance of an application,
or more generally each instance in a collection:

    function Item() {
      var space = within(); // create a new space for single use

      function publish( name, value ){
        // publish an event only for this item
        space.publish( name, value );
      }

      // each item can process its own events
      // without additional filtering required
    }

An alternative would be to assign a different id to each item in the
collection, and use it to customize either the event name or the data:

    // customize the event name using the id
    publish( "example.org/collection/" + id, data );

    // the subscription must build the event name in the same way
    subscribe( "example.org/collection/" + id, function( data ) {
      // process the event
    });

    // customize the data using the id
    data.id = id;
    publish( "example.org/collection", data );

    subscribe( "example.org/collection", function( data ) {
      // an extra filter is required in the event subscriber
      if ( data.id !== id ) {
        return;
      }

      // process the event
    });

### <a name="within_within">`within( 'within.js.org' )`</a> ###

The library within.js itself publishes useful properties and events in the
namespace 'within.js.org' (which is
[the public URL of its documentation](http://within.js.org)):

* `version` - string, the version of the library
* `missing` - object, initially null, value of the `'missing'` event
  published when a subscription is created before the target
  property has been set. The event object has two properties:
  * space - string, the name of the data space
  * property - string, the name of the property with no value
* `data` - object, hash of all named data spaces; each property is the
           name of a data space and the value is the corresping object
           which holds data for the space. This is the same object provided
           as context to functions which run `within()` this space.
* `subscribers` - object, hash of data space names to objects which store
                  the lists of subscribers for each property of the space;
                  these objects are themselves hashes where property names
                  are associated with arrays of functions subcribed to the
                  corresponding events.

RELEASE HISTORY
---------------

* v1.0.0 - Stable API
* v1.1.0 - Add version number in `within('within.js.org').get('version')`
* v1.2.0 - Add third parameter `now` to `subscribe()`, to delay subscriptions
* v1.3.0 - Publish event `'missing'` within `'within.js.org'` to report
           subscriptions to a property before any value has been set.
* v1.4.0 - Store data spaces in `within('within.js.org').get('data')` and
           event subscriptions in `within('within.js.org').get('subscribers')`
           to allow listing data spaces and subscribers for debugging purpose,
           and deleting data spaces and subscribers to free memory if need be.
* v1.5.0 - Add callback parameter to `get()` for one-time subscription

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

