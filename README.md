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
  yourself in the future.

  The callback function runs immediately, within the context of an object
  that corresponds to the module, always the same in all instances with
  the same name, and four functions to share properties and events within
  this shared symbolic space.

  The get() and set() functions simply get and set properties of the context
  object, without publishing any event. The advantage of get() over directly
  setting a property on 'this' is that it only retrieves the value of own
  properties, not inherited properties, which makes it behave like a hash.
  There is no particular advantage of set(), which is only provided for
  symmetry.

  The publish() function broadcasts to listeners registered with subscribe()
  the value of an event, which is also set to the property of the same name:

    publish( "example-event", "this value is broadcast within this module" );

    get( "example-event" ) === "this value is broadcast within this module";
    // true

  When a listener is registered with subscribe(), it fires immediately with
  the current value of the property if it has already been set:

    subscribe( "example-event", function( value ) {
      // called immediately
      value === "this value is broadcast within this module"; // true
    });

  This way, even listeners registered after the first value is published get
  triggered immediately, rather than missing the first broadcast altogether.

LANGUAGE
---------

  JavaScript  

AUTHOR
------

  Eric Bréchemier  
  http://eric.brechemier.name

LICENSE
-------

  [MIT License][MIT]  
  [LICENSE.txt](LICENSE.txt)

  [MIT]: http://opensource.org/licenses/MIT

