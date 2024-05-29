export default class FirebaseWriteThroughCache {
    constructor(db, useCache = true) {
        this.db = db;
        this.cache = {};
        this.useCache = useCache;
    }

    async getDocument(collection, id) {
        const cacheId = `${collection}:${id}`;

        if (this.useCache && this.cache[cacheId]) {
            console.log("cache hit:", cacheId);
            return this.cache[cacheId];
        }

        const doc = await this.db.collection(collection).doc(id).get();
        if (doc.exists) {
            if (this.useCache) {
                this.cache[cacheId] = doc.data();
            }
            return doc.data();
        }

        return null;
    }

    async query(collection, conditions) {
        let cacheId = collection;
        conditions.forEach((condition) => {
            cacheId += `:${condition.field}:${condition.value}`;
        });

        if (this.useCache && this.cache[cacheId]) {
            console.log("cache hit:", cacheId);
            return this.cache[cacheId];
        }

        let query = this.db.collection(collection);
        conditions.forEach((condition) => {
            if ("operator" in condition) {
                query = query.where(condition.field, condition.operator, condition.value);
            } else {
                query = query.where(condition.field, '==', condition.value);
            }
        });

        const results = await query.get();
        const documents = results.docs.map((doc) => doc.data());

        if (this.useCache) {
            this.cache[cacheId] = documents;
        }

        return documents;
    }

    invalidateDocument(collection, id) {
        const cacheId = `${collection}:${id}`;
        delete this.cache[cacheId];
    }

    invalidateQuery(collection, conditions) {
        let cacheId = collection;
        conditions.forEach((condition) => {
            cacheId += `:${condition.field}:${condition.value}`;
        });

        delete this.cache[cacheId];
    }

    async saveExistingDocument(collection, id, data) {
        const cacheId = `$collection:$id`;
        // Invalidate the cached document
        this.invalidateDocument(collection, id);

        // Get the array of objects from the cache
        const cacheArrayId = `$collection:array`;
        const cachedArray = this.cache[cacheArrayId] || [];

        // Find the index of the object with the matching ID in the array
        const index = cachedArray.findIndex(obj => obj.id === id);

        if (index !== -1) {
            // Update the object in the array with the new data
            cachedArray[index] = { id, ...data };
        } else {
            // Add the new object to the array
            cachedArray.push({ id, ...data });
        }

        // Update the cache with the updated array
        this.cache[cacheArrayId] = cachedArray;

        // Save the data to Firebase
        await this.db.collection(collection).doc(id).set(data);

        // Return the original data.
        return data;
    }

    async addNewDocument(collection, data) {
        // Add a new document to the specified collection
        const docRef = await this.db.collection(collection).add(data);

        // Since a new document is added, invalidate any query caches that are based on this collection
        for (const cacheKey in this.cache) {
            if (cacheKey.startsWith(collection)) {
                const conditions = cacheKey.split(':').slice(1).reduce((acc, curr, index, array) => {
                    if (index % 2 === 0) {
                        acc.push({ field: array[index], value: array[index + 1] });
                    }
                    return acc;
                }, []);
                console.log("cache hit:", cacheKey, conditions);
                this.invalidateQuery(collection, conditions);
            }
        }

        // Insert the new document into the list in the cache
        const cacheListId = `$collection:list`;
        const cachedList = this.cache[cacheListId] || [];
        cachedList.push({ id: docRef.id, ...data });
        this.cache[cacheListId] = cachedList;

        // Return the ID of the new document
        return docRef.id;
    }

    async deleteDocumentById(collection, id) {
        // Invalidate the cached document
        this.invalidateDocument(collection, id);

        // Delete the document from Firebase
        await this.db.collection(collection).doc(id).delete();
    }

    async deleteByQuery(collection, conditions) {
        let query = this.db.collection(collection);
        conditions.forEach((condition) => {
            if ("operator" in condition) {
                query = query.where(condition.field, condition.operator, condition.value);
            } else {
                query = query.where(condition.field, '==', condition.value);
            }
        });

        // Get documents based on the query
        const results = await query.get();

        // Invalidate the cached query
        this.invalidateQuery(collection, conditions);

        // Delete each document fetched by the query
        const batch = this.db.batch();
        results.docs.forEach((doc) => {
            batch.delete(doc.ref);
            this.invalidateDocument(collection, doc.id);
        });
        await batch.commit();
    }
}
