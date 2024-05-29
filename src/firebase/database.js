import { Timestamp } from 'firebase-admin/firestore';
import { db } from './connection';
import FirebaseWriteThroughCache from './FirebaseWritethroughCache';

// ==============================================================================
// ==============================================================================
// connecting to the database.
// ------------------------------------------------------------------------------

const cacheDb = new FirebaseWriteThroughCache(db, false);

// ==============================================================================
// ==============================================================================
// player functions.
// ------------------------------------------------------------------------------


export const getTimestamp = function () {
    // crazy precision, yo.  turn that down.
    const timeObj = Timestamp.fromDate(new Date());
    const returnStamp = parseFirestoreTimestampObject(timeObj);
    // logger.log("timestamp:", returnStamp);
    return returnStamp;
}
