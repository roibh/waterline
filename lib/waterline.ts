//  ██╗    ██╗ █████╗ ████████╗███████╗██████╗ ██╗     ██╗███╗   ██╗███████╗
//  ██║    ██║██╔══██╗╚══██╔══╝██╔════╝██╔══██╗██║     ██║████╗  ██║██╔════╝
//  ██║ █╗ ██║███████║   ██║   █████╗  ██████╔╝██║     ██║██╔██╗ ██║█████╗
//  ██║███╗██║██╔══██║   ██║   ██╔══╝  ██╔══██╗██║     ██║██║╚██╗██║██╔══╝
//  ╚███╔███╔╝██║  ██║   ██║   ███████╗██║  ██║███████╗██║██║ ╚████║███████╗
//   ╚══╝╚══╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝╚═╝  ╚═╝╚══════╝╚═╝╚═╝  ╚═══╝╚══════╝
//
import Orm from './orm';

var assert = require('assert');
var _ = require('@sailshq/lodash');
var async = require('async');
var Schema = require('waterline-schema');
var buildDatastoreMap = require('./waterline/utils/system/datastore-builder');
var buildLiveWLModel = require('./waterline/utils/system/collection-builder');
var BaseMetaModel = require('./waterline/MetaModel');
var getModel = require('./waterline/utils/ontology/get-model');


/**
 * ORM (Waterline)
 *
 * Construct a Waterline ORM instance.
 *
 * @constructs {Waterline}
 */
// // function Waterline() {

// //   // Start by setting up an array of model definitions.
// //   // (This will hold the raw model definitions that were passed in,
// //   // plus any implicitly introduced models-- but that part comes later)
// //   var modelDefs = [];

// //   // Hold a map of the instantaited and active datastores and models.
// //   var modelMap = {};
// //   var datastoreMap = {};

// //   // This "context" dictionary will be passed into the BaseMetaModel constructor
// //   // later every time we instantiate a new BaseMetaModel instance (e.g. `User`
// //   // or `Pet` or generically, sometimes called "WLModel" -- sorry about the
// //   // capital letters!!)
// //   //
// //   var context = {
// //     collections: modelMap,
// //     datastores: datastoreMap
// //   };
// //   // ^^FUTURE: Level this out (This is currently just a stop gap to prevent
// //   // re-writing all the "collection query" stuff.)


// //   // Now build an ORM instance.
// //   var orm = new Orm();




// //   //  ╦═╗╔═╗╔╦╗╦ ╦╦═╗╔╗╔  ┌┐┌┌─┐┬ ┬  ┌─┐┬─┐┌┬┐  ┬┌┐┌┌─┐┌┬┐┌─┐┌┐┌┌─┐┌─┐
// //   //  ╠╦╝║╣  ║ ║ ║╠╦╝║║║  │││├┤ │││  │ │├┬┘│││  ││││└─┐ │ ├─┤││││  ├┤
// //   //  ╩╚═╚═╝ ╩ ╚═╝╩╚═╝╚╝  ┘└┘└─┘└┴┘  └─┘┴└─┴ ┴  ┴┘└┘└─┘ ┴ ┴ ┴┘└┘└─┘└─┘
// //   return orm;

// // }

// Export the Waterline ORM constructor.
module.exports = new Orm();











/**
 * Waterline.start()
 *
 * Build and initialize a new Waterline ORM instance using the specified
 * userland ontology, including model definitions, datastore configurations,
 * and adapters.
 *
 * --EXPERIMENTAL--
 *
 * @param  {Dictionary} options
 *         @property {Dictionary} models
 *         @property {Dictionary} datastores
 *         @property {Dictionary} adapters
 *         @property {Dictionary?} defaultModelSettings
 *
 * @param {Function} done
 *        @param {Error?} err
 *        @param {Ref} orm
 */

 
