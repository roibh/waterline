/**
 * Module dependencies
 */
import {IQuery} from '../interfaces/query';

var _ = require('@sailshq/lodash');
var flaverr = require('flaverr');
var parley = require('parley');
var buildOmen = require('../utils/query/build-omen');
var forgeStageTwoQuery = require('../utils/query/forge-stage-two-query');
var getQueryModifierMethods = require('../utils/query/get-query-modifier-methods');
var helpFind = require('../utils/query/help-find');
var processAllRecords = require('../utils/query/process-all-records');
var verifyModelMethodContext = require('../utils/query/verify-model-method-context');


/**
 * Module constants
 */

var DEFERRED_METHODS = getQueryModifierMethods('find');


/**
 * find()
 *
 * Find records that match the specified criteria.
 *
 * ```
 * // Look up all bank accounts with more than $32,000 in them.
 * BankAccount.find().where({
 *   balance: { '>': 32000 }
 * }).exec(function(err, bankAccounts) {
 *   // ...
 * });
 * ```
 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 *
 * Usage without deferred object:
 * ================================================
 *
 * @param {Dictionary?} criteria
 *
 * @param {Dictionary} populates
 *
 * @param {Function?} explicitCbMaybe
 *        Callback function to run when query has either finished successfully or errored.
 *        (If unspecified, will return a Deferred object instead of actually doing anything.)
 *
 * @param {Ref?} meta
 *     For internal use.
 *
 * @returns {Ref?} Deferred object if no `explicitCbMaybe` callback was provided
 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 *
 * The underlying query keys:
 * ==============================
 *
 * @qkey {Dictionary?} criteria
 * @qkey {Dictionary?} populates
 *
 * @qkey {Dictionary?} meta
 * @qkey {String} using
 * @qkey {String} method
 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 */
export class MethodFind {
  public static execute(obj, criteria?, populates?, explicitCbMaybe?, meta?) {
    // Verify `this` refers to an actual Sails/Waterline model.
    verifyModelMethodContext(obj);

    // Set up a few, common local vars for convenience / familiarity.
    var WLModel = obj;
    var orm = obj.waterline;
    var modelIdentity = obj.identity;

    // Build an omen for potential use in the asynchronous callbacks below.
    var omen = buildOmen(obj);

    // Build query w/ initial, universal keys.
    var query: IQuery = {
      method: 'find',
      using: modelIdentity
    };


    //  ██╗   ██╗ █████╗ ██████╗ ██╗ █████╗ ██████╗ ██╗ ██████╗███████╗
    //  ██║   ██║██╔══██╗██╔══██╗██║██╔══██╗██╔══██╗██║██╔════╝██╔════╝
    //  ██║   ██║███████║██████╔╝██║███████║██║  ██║██║██║     ███████╗
    //  ╚██╗ ██╔╝██╔══██║██╔══██╗██║██╔══██║██║  ██║██║██║     ╚════██║
    //   ╚████╔╝ ██║  ██║██║  ██║██║██║  ██║██████╔╝██║╚██████╗███████║
    //    ╚═══╝  ╚═╝  ╚═╝╚═╝  ╚═╝╚═╝╚═╝  ╚═╝╚═════╝ ╚═╝ ╚═════╝╚══════╝
    //

    // The `explicitCbMaybe` callback, if one was provided.
    var explicitCbMaybe;

    // Handle the various supported usage possibilities
    // (locate the `explicitCbMaybe` callback, and extend the `query` dictionary)
    //
    // > Note that we define `args` to minimize the chance of this "variadics" code
    // > introducing any unoptimizable performance problems.  For details, see:
    // > https://github.com/petkaantonov/bluebird/wiki/Optimization-killers#32-leaking-arguments
    // > •=> `.length` is just an integer, this doesn't leak the `arguments` object itself
    // > •=> `i` is always valid index in the arguments object
    var args = new Array(arguments.length);
    for (var i = 0; i < args.length; ++i) {
      args[i] = arguments[i];
    }

    // • find(explicitCbMaybe, ...)
    if (args.length >= 1 && _.isFunction(args[0])) {
      explicitCbMaybe = args[0];
      query.meta = args[1];
    }
    // • find(criteria, explicitCbMaybe, ...)
    else if (args.length >= 2 && _.isFunction(args[1])) {
      query.criteria = args[0];
      explicitCbMaybe = args[1];
      query.meta = args[2];
    }
    // • find()
    // • find(criteria)
    // • find(criteria, populates, ...)
    else {
      query.criteria = args[0];
      query.populates = args[1];
      explicitCbMaybe = args[2];
      query.meta = args[3];
    }


    //  ██████╗ ███████╗███████╗███████╗██████╗
    //  ██╔══██╗██╔════╝██╔════╝██╔════╝██╔══██╗
    //  ██║  ██║█████╗  █████╗  █████╗  ██████╔╝
    //  ██║  ██║██╔══╝  ██╔══╝  ██╔══╝  ██╔══██╗
    //  ██████╔╝███████╗██║     ███████╗██║  ██║
    //  ╚═════╝ ╚══════╝╚═╝     ╚══════╝╚═╝  ╚═╝
    //
    //   ██╗███╗   ███╗ █████╗ ██╗   ██╗██████╗ ███████╗██╗
    //  ██╔╝████╗ ████║██╔══██╗╚██╗ ██╔╝██╔══██╗██╔════╝╚██╗
    //  ██║ ██╔████╔██║███████║ ╚████╔╝ ██████╔╝█████╗   ██║
    //  ██║ ██║╚██╔╝██║██╔══██║  ╚██╔╝  ██╔══██╗██╔══╝   ██║
    //  ╚██╗██║ ╚═╝ ██║██║  ██║   ██║   ██████╔╝███████╗██╔╝
    //   ╚═╝╚═╝     ╚═╝╚═╝  ╚═╝   ╚═╝   ╚═════╝ ╚══════╝╚═╝
    //
    //  ┌┐ ┬ ┬┬┬  ┌┬┐   ┬   ┬─┐┌─┐┌┬┐┬ ┬┬─┐┌┐┌  ┌┐┌┌─┐┬ ┬  ┌┬┐┌─┐┌─┐┌─┐┬─┐┬─┐┌─┐┌┬┐
    //  ├┴┐│ │││   ││  ┌┼─  ├┬┘├┤  │ │ │├┬┘│││  │││├┤ │││   ││├┤ ├┤ ├┤ ├┬┘├┬┘├┤  ││
    //  └─┘└─┘┴┴─┘─┴┘  └┘   ┴└─└─┘ ┴ └─┘┴└─┘└┘  ┘└┘└─┘└┴┘  ─┴┘└─┘└  └─┘┴└─┴└─└─┘─┴┘
    //  ┌─    ┬┌─┐  ┬─┐┌─┐┬  ┌─┐┬  ┬┌─┐┌┐┌┌┬┐    ─┐
    //  │───  │├┤   ├┬┘├┤ │  ├┤ └┐┌┘├─┤│││ │   ───│
    //  └─    ┴└    ┴└─└─┘┴─┘└─┘ └┘ ┴ ┴┘└┘ ┴     ─┘
    // If a callback function was not specified, then build a new Deferred and bail now.
    //
    // > This method will be called AGAIN automatically when the Deferred is executed.
    // > and next time, it'll have a callback.
    return parley(

      function (done) {

        // Otherwise, IWMIH, we know that a callback was specified.
        // So...

        //  ███████╗██╗  ██╗███████╗ ██████╗██╗   ██╗████████╗███████╗
        //  ██╔════╝╚██╗██╔╝██╔════╝██╔════╝██║   ██║╚══██╔══╝██╔════╝
        //  █████╗   ╚███╔╝ █████╗  ██║     ██║   ██║   ██║   █████╗
        //  ██╔══╝   ██╔██╗ ██╔══╝  ██║     ██║   ██║   ██║   ██╔══╝
        //  ███████╗██╔╝ ██╗███████╗╚██████╗╚██████╔╝   ██║   ███████╗
        //  ╚══════╝╚═╝  ╚═╝╚══════╝ ╚═════╝ ╚═════╝    ╚═╝   ╚══════╝

        //  ╔═╗╔═╗╦═╗╔═╗╔═╗  ┌─┐┌┬┐┌─┐┌─┐┌─┐  ┌┬┐┬ ┬┌─┐  ┌─┐ ┬ ┬┌─┐┬─┐┬ ┬
        //  ╠╣ ║ ║╠╦╝║ ╦║╣   └─┐ │ ├─┤│ ┬├┤    │ ││││ │  │─┼┐│ │├┤ ├┬┘└┬┘
        //  ╚  ╚═╝╩╚═╚═╝╚═╝  └─┘ ┴ ┴ ┴└─┘└─┘   ┴ └┴┘└─┘  └─┘└└─┘└─┘┴└─ ┴
        //
        // Forge a stage 2 query (aka logical protostatement)
        try {
          forgeStageTwoQuery(query, orm);
        } catch (e) {
          switch (e.code) {

            case 'E_INVALID_CRITERIA':
              return done(
                flaverr(
                  {
                    name: 'UsageError'
                  },
                  new Error(
                    'Invalid criteria.\n' +
                    'Details:\n' +
                    '  ' + e.details + '\n'
                  )
                )
              );

            case 'E_INVALID_POPULATES':
              return done(
                flaverr(
                  {
                    name: 'UsageError'
                  },
                  new Error(
                    'Invalid populate(s).\n' +
                    'Details:\n' +
                    '  ' + e.details + '\n'
                  )
                )
              );

            case 'E_NOOP':
              return done(undefined, []);

            default:
              return done(e);
          }
        } // >-•

        //  ┬ ┬┌─┐┌┐┌┌┬┐┬  ┌─┐  ╔╗ ╔═╗╔═╗╔═╗╦═╗╔═╗  ┬  ┬┌─┐┌─┐┌─┐┬ ┬┌─┐┬  ┌─┐  ┌─┐┌─┐┬  ┬  ┌┐ ┌─┐┌─┐┬┌─
        //  ├─┤├─┤│││ │││  ├┤   ╠╩╗║╣ ╠╣ ║ ║╠╦╝║╣   │  │├┤ ├┤ │  └┬┘│  │  ├┤   │  ├─┤│  │  ├┴┐├─┤│  ├┴┐
        //  ┴ ┴┴ ┴┘└┘─┴┘┴─┘└─┘  ╚═╝╚═╝╚  ╚═╝╩╚═╚═╝  ┴─┘┴└  └─┘└─┘ ┴ └─┘┴─┘└─┘  └─┘┴ ┴┴─┘┴─┘└─┘┴ ┴└─┘┴ ┴
        // Determine what to do about running any lifecycle callbacks
        (function _maybeRunBeforeLC(proceed) {
          // If the `skipAllLifecycleCallbacks` meta flag was set, don't run any of
          // the methods.
          if (_.has(query.meta, 'skipAllLifecycleCallbacks') && query.meta.skipAllLifecycleCallbacks) {
            return proceed(undefined, query);
          }

          // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
          // FUTURE: This is where the `beforeFind()` lifecycle callback would go
          // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
          return proceed(undefined, query);

        })(function _afterPotentiallyRunningBeforeLC(err, query) {
          if (err) {
            return done(err);
          }


          // ================================================================================
          // FUTURE: potentially bring this back (but also would need the `omit clause`)
          // ================================================================================
          // // Before we get to forging again, save a copy of the stage 2 query's
          // // `select` clause.  We'll need this later on when processing the resulting
          // // records, and if we don't copy it now, it might be damaged by the forging.
          // //
          // // > Note that we don't need a deep clone.
          // // > (That's because the `select` clause is only 1 level deep.)
          // var s2QSelectClause = _.clone(query.criteria.select);
          // ================================================================================

          //  ┌─┐┌─┐┌┐┌┌┬┐  ┌┬┐┌─┐  ╔═╗╔╦╗╔═╗╔═╗╔╦╗╔═╗╦═╗
          //  └─┐├┤ │││ ││   │ │ │  ╠═╣ ║║╠═╣╠═╝ ║ ║╣ ╠╦╝
          //  └─┘└─┘┘└┘─┴┘   ┴ └─┘  ╩ ╩═╩╝╩ ╩╩   ╩ ╚═╝╩╚═
          // Use `helpFind()` to forge stage 3 quer(y/ies) and then call the appropriate adapters' method(s).
          // > Note: `helpFind` is responsible for running the `transformer`.
          // > (i.e. so that column names are transformed back into attribute names)
          helpFind(WLModel, query, omen, function _afterFetchingRecords(err, populatedRecords) {
            if (err) {
              return done(err);
            }//-•

            // Process the record to verify compliance with the adapter spec.
            // Check the record to verify compliance with the adapter spec.,
            // as well as any issues related to stale data that might not have been
            // been migrated to keep up with the logical schema (`type`, etc. in
            // attribute definitions).
            try {
              processAllRecords(populatedRecords, query.meta, modelIdentity, orm);
            } catch (e) { return done(e); }

            //  ┬ ┬┌─┐┌┐┌┌┬┐┬  ┌─┐  ╔═╗╔═╗╔╦╗╔═╗╦═╗  ┬  ┬┌─┐┌─┐┌─┐┬ ┬┌─┐┬  ┌─┐  ┌─┐┌─┐┬  ┬  ┌┐ ┌─┐┌─┐┬┌─
            //  ├─┤├─┤│││ │││  ├┤   ╠═╣╠╣  ║ ║╣ ╠╦╝  │  │├┤ ├┤ │  └┬┘│  │  ├┤   │  ├─┤│  │  ├┴┐├─┤│  ├┴┐
            //  ┴ ┴┴ ┴┘└┘─┴┘┴─┘└─┘  ╩ ╩╚   ╩ ╚═╝╩╚═  ┴─┘┴└  └─┘└─┘ ┴ └─┘┴─┘└─┘  └─┘┴ ┴┴─┘┴─┘└─┘┴ ┴└─┘┴ ┴
            (function _maybeRunAfterLC(proceed) {

              // If the `skipAllLifecycleCallbacks` meta key was enabled, then don't run this LC.
              if (_.has(query.meta, 'skipAllLifecycleCallbacks') && query.meta.skipAllLifecycleCallbacks) {
                return proceed(undefined, populatedRecords);
              }//-•

              // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
              // FUTURE: This is where the `afterFind()` lifecycle callback would go
              // - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
              return proceed(undefined, populatedRecords);

            })(function _afterPotentiallyRunningAfterLC(err, populatedRecords) {
              if (err) { return done(err); }

              // All done.
              return done(undefined, populatedRecords);

            });//</ self-calling functionto handle "after" lifecycle callback >
          }); //</ helpFind() >
        }); //</ self-calling function to handle "before" lifecycle callback >

      },


      explicitCbMaybe,


      _.extend(DEFERRED_METHODS, {

        // Provide access to this model for use in query modifier methods.
        _WLModel: WLModel,

        // Set up initial query metadata.
        _wlQueryInfo: query,

      })

    );//</ parley() >

  }
}


