// ==========================================================================
// Project:   Todos.TaskDataSource
// Copyright: ©2011 My Company, Inc.
// ==========================================================================
/*globals Todos */

/** @class

  (Document Your Data Source Here)

  @extends SC.DataSource
*/
sc_require('models/task');
Todos.TASKS_QUERY = SC.Query.local(Todos.Task, {orderBy: 'isDone,description'});


Todos.TaskDataSource = SC.DataSource.extend({

	//private variable..
	_dbpath: 'todos',
	
	
	//theses are helper methods that help format the URL string..
	getServerPath: function(resourceName) {
	     var path = '/' + this._dbpath + "//" + resourceName;
	     return path;
	},
	     getServerView: function(viewName) {
	     var path = '/' + this._dbpath + "/_design/app/_view/" + viewName;
	     return path;
	},


  fetch: function(store, query) {
	     if (query === Todos.TASKS_QUERY) {
			//this is the HTTP request that we are using to is using the helper methods to call the URL
	          SC.Request.getUrl(this.getServerView('allTasks')).json()
	                         .header('Accept', 'application/json')
	                         .notify(this, 'didFetchTasks', store, query)
	                         .send();
	          return YES;
	     }
	    return NO ; // return YES if you handled the query
	  },
	
		didFetchTasks: function(response, store, query) {
		  if(SC.ok(response)) {
			
		    var body = response.get('encodedBody');
		    var couchResponse = SC.json.decode(body);
		    var records = couchResponse.rows.getEach('value');
		    store.loadRecords(Todos.Task, records);
		    store.dataSourceDidFetchQuery(query);
		 } else {
		    store.dataSourceDidErrorQuery(query, response);
		 }
		 },

  // ..........................................................
  // RECORD SUPPORT
  // 
  
  retrieveRecord: function(store, storeKey) {
	      return NO ; // return YES if you handled the storeKey
	  },
  	processResponse: function(response) {
		          if (SC.ok(response)) {
		               var body = response.get('encodedBody');
		               var couchResponse = SC.json.decode(body);
		               var ok = couchResponse.ok;
		               if (ok != YES) return {"error":true, "response":couchResponse};
		                    var id = couchResponse.id;
		                    var rev = couchResponse.rev;
		                    return {"ok":true, "id": id, "rev": rev};
		               } else {
		    	               return {"error":true, "response":response};
		               }
		       },
					getDocRev: function(doc) {
					return doc._rev;
					  },
  	createRecord: function(store, storeKey) {
		     if (SC.kindOf(store.recordTypeFor(storeKey), Todos.Task)) {
		          SC.Request.postUrl(this.getServerPath('/')).json()
		                            .header('Accept', 'application/json')
		                            .notify(this, this.didCreateTask, store, storeKey)
		                            .send(store.readDataHash(storeKey));
		          return YES;
		    } 
		    return NO ; // return YES if you handled the storeKey
		  },
			didCreateTask: function(response, store, storeKey) {
			     var couchRes = this.processResponse(response);
			     if (couchRes.ok) {
			          // Add _id and _rev to the local document for further server interaction.
			          var localDoc = store.readDataHash(storeKey);
			          localDoc._id = couchRes.id;
			          localDoc._rev = couchRes.rev;
			          store.dataSourceDidComplete(storeKey, localDoc, couchRes.id);
			     } else {
			        store.dataSourceDidError(storeKey, response);
			     }
			},
  
  		updateRecord: function(store, storeKey) {    
			  if (SC.kindOf(store.recordTypeFor(storeKey), Todos.Task)) {
			     var id = store.idFor(storeKey);
			     var dataHash = store.readDataHash(storeKey);
			     SC.Request.putUrl(this.getServerPath(id)).json()
			                       .header('Accept', 'application/json')
			                      .notify(this, this.didUpdateTask, store, storeKey)
			                        .send(dataHash);
			     return YES;
			   }
			   return NO;
			},
			didUpdateTask: function(response, store, storeKey) {
			   var couchRes = this.processResponse(response);
			   if (couchRes.ok) {
			     // Update the local _rev of this document.
			     var localDoc = store.readDataHash(storeKey);
			     localDoc._rev = couchRes.rev;
			     store.dataSourceDidComplete(storeKey, localDoc) ;
			   } else {
			     store.dataSourceDidError(storeKey);
			   }
			},
			
  
  		destroyRecord: function(store, storeKey) {
			    if (SC.kindOf(store.recordTypeFor(storeKey), Todos.Task)) {
			          var id = store.idFor(storeKey);
			          //var rev = this._docsRev[id];
			          var dataHash = store.readDataHash(storeKey);
			          var rev = this.getDocRev(dataHash);
			          SC.Request.deleteUrl(this.getServerPath(id + "?rev=" + rev)).json()
			                            .header('Accept', 'application/json')
			                            .notify(this, this.didDeleteTask, store, storeKey)
			                            .send();
			          return YES;
			     } 
			     return NO ; // return YES if you handled the storeKey
			  },
				didDeleteTask: function(response, store, storeKey) {
				     var couchRes = this.processResponse(response);
				     if (couchRes.ok) {
				          store.dataSourceDidDestroy(storeKey);
				     } else {
				          store.dataSourceDidError(response);
				     }
				  }
  
}) ;
; if ((typeof SC !== 'undefined') && SC && SC.Module && SC.Module.scriptDidLoad) SC.Module.scriptDidLoad('todos');