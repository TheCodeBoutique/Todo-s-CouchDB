// ==========================================================================
// Project:   Todos.Task
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals Todos */

/** @class

  (Document your Model here)

  @extends SC.Record
  @version 0.1
*/
Todos.Task = SC.Record.extend(
/** @scope Todos.Task.prototype */ {

 isDone: SC.Record.attr(Boolean),
  description: SC.Record.attr(String)

}) ;
