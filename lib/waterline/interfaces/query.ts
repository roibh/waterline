export interface IQuery {
    waterline?: any;
    identity?: any;
    method?: string;
    using?: any;
    meta?: any;
    criteria?: any;
    populates?: any;
    numericAttrName?: any;
    valuesToSet?: any;
    eachRecordFn?: any;

    targetRecordIds?: any;
    collectionAttrName?: string;
    eachBatchFn?: any;
    associatedIds?: any;
    newRecords?: any;
    newRecord?: any;


}


export interface IModelIdentity {

}