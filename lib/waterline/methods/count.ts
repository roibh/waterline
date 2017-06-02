/**
 * Module dependencies
 */
import { IQuery } from '../interfaces/query';
var _ = require('@sailshq/lodash');
var parley = require('parley');
var buildOmen = require('../utils/query/build-omen');
var forgeAdapterError = require('../utils/query/forge-adapter-error');
var forgeStageTwoQuery = require('../utils/query/forge-stage-two-query');
var forgeStageThreeQuery = require('../utils/query/forge-stage-three-query');
var getQueryModifierMethods = require('../utils/query/get-query-modifier-methods');
var verifyModelMethodContext = require('../utils/query/verify-model-method-context');


/**
 * Module constants
 */

var DEFERRED_METHODS = getQueryModifierMethods('count');


/**
 * count()
 *
 * Get the number of matching records matching a criteria.
 *
 * ```
 * // The number of bank accounts with more than $32,000 in them.
 * BankAccount.count().where({
 *   balance: { '>': 32000 }
 * }).exec(function(err, numBankAccounts) {
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
 * @param {Function?} explicitCbMaybe
 *        Callback function to run when query has either finished successfully or errored.
 *        (If unspecified, will return a Deferred object instead of actually doing anything.)
 *
 * @param {Ref?} meta
 *     For internal use.
 *
 * @param {Dictionary} moreQueryKeys
 *        For internal use.
 *        (A dictionary of query keys.)
 *
 * @returns {Ref?} Deferred object if no `explicitCbMaybe` callback was provided
 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 *
 * The underlying query keys:
 * ==============================
 *
 * @qkey {Dictionary?} criteria
 *
 * @qkey {Dictionary?} meta
 * @qkey {String} using
 * @qkey {String} method
 *
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 */
export class MethodCount {
  public static execute(obj, criteria?, explicitCbMaybe?, meta?, moreQueryKeys?) {

    // Verify `this` refers to an actual Sails/Waterline model.
    verifyModelMethodContext(obj);

    // Set up a few, common local vars for convenience / familiarity.
    var WLModel = obj;
    var orm = obj.waterline;
    var modelIdentity = obj.identity;

    // Build an omen for potential use in the asynchronous callback below.
    var omen = buildOmen(this);

    // Build query w/ initial, universal keys.
    var query: IQuery = {
      method: 'count',
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

    // • count(explicitCbMaybe, ..., ...)
    if (args.length >= 1 && _.isFunction(args[0])) {
      explicitCbMaybe = args[0];
      query.meta = args[1];
      if (args[2]) { _.extend(query, args[2]); }
    }
    // • count(criteria, ..., ..., ...)
    else {
      query.criteria = args[0];
      explicitCbMaybe = args[1];
      query.meta = args[2];
      if (args[3]) { _.extend(query, args[3]); }
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
    // If an explicit callback function was specified, then immediately run the logic below
    // and trigger the explicit callback when the time comes.  Otherwise, build and return
    // a new Deferred now. (If/when the Deferred is executed, the logic below will run.)
    return parley(

      function (done) {

        // Otherwise, IWMIH, we know that it's time to actually do some stuff.
        // So...
        //
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
            case 'E_INVALID_META':
              return done(e);
            // ^ when the standard usage error is good enough as-is, without any further customization

            case 'E_NOOP':
              return done(undefined, 0);

            default:
              return done(e);
            // ^ when an internal, miscellaneous, or unexpected error occurs
          }
        } // >-•


        //  ╔═╗╔═╗╦═╗╔═╗╔═╗  ┌─┐┌┬┐┌─┐┌─┐┌─┐  ┌┬┐┬ ┬┬─┐┌─┐┌─┐  ┌─┐ ┬ ┬┌─┐┬─┐┬ ┬
        //  ╠╣ ║ ║╠╦╝║ ╦║╣   └─┐ │ ├─┤│ ┬├┤    │ ├─┤├┬┘├┤ ├┤   │─┼┐│ │├┤ ├┬┘└┬┘
        //  ╚  ╚═╝╩╚═╚═╝╚═╝  └─┘ ┴ ┴ ┴└─┘└─┘   ┴ ┴ ┴┴└─└─┘└─┘  └─┘└└─┘└─┘┴└─ ┴
        try {
          query = forgeStageThreeQuery({
            stageTwoQuery: query,
            identity: modelIdentity,
            transformer: WLModel._transformer,
            originalModels: orm.collections
          });
        } catch (e) { return done(e); }


        //  ┌─┐┌─┐┌┐┌┌┬┐  ┌┬┐┌─┐  ╔═╗╔╦╗╔═╗╔═╗╔╦╗╔═╗╦═╗
        //  └─┐├┤ │││ ││   │ │ │  ╠═╣ ║║╠═╣╠═╝ ║ ║╣ ╠╦╝
        //  └─┘└─┘┘└┘─┴┘   ┴ └─┘  ╩ ╩═╩╝╩ ╩╩   ╩ ╚═╝╩╚═
        // Grab the appropriate adapter method and call it.
        var adapter = WLModel._adapter;
        if (!adapter.count) {
          return done(new Error('The adapter used by this model (`' + modelIdentity + '`) doesn\'t support the `' + query.method + '` method.'));
        }

        adapter.count(WLModel.datastore, query, function _afterTalkingToAdapter(err, numRecords) {
          if (err) {
            err = forgeAdapterError(err, omen, 'count', modelIdentity, orm);
            return done(err);
          }

          return done(undefined, numRecords);

        });//</adapter.count()>

      },


      explicitCbMaybe,


      _.extend(DEFERRED_METHODS, {

        // Provide access to this model for use in query modifier methods.
        _WLModel: WLModel,

        // Set up initial query metadata.
        _wlQueryInfo: query,

      })

    );//</parley>
  }
}