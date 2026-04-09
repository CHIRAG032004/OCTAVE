const { getFirestore } = require('../config/firebase');

const collectionName = 'logs';

const Log = {
  collection: () => getFirestore().collection(collectionName),

  create: async (data) => {
    try {
      const timestamp = new Date();
      const docRef = await Log.collection().add({
        ...data,
        createdAt: timestamp,
        updatedAt: timestamp,
      });
      const doc = await docRef.get();
      return { _id: doc.id, ...doc.data() };
    } catch (error) {
      throw error;
    }
  },

  find: async (filter = {}) => {
    try {
      let query = Log.collection();
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && key !== 'createdAt') {
          query = query.where(key, '==', value);
        }
      });

      if (filter.createdAt) {
        if (filter.createdAt.$gte) query = query.where('createdAt', '>=', filter.createdAt.$gte);
        if (filter.createdAt.$lte) query = query.where('createdAt', '<=', filter.createdAt.$lte);
      }

      const snapshot = await query.get();
      return snapshot.docs.map((doc) => ({ _id: doc.id, ...doc.data() }));
    } catch (error) {
      throw error;
    }
  },

  countDocuments: async (filter = {}) => {
    try {
      let query = Log.collection();
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && key !== 'createdAt') {
          query = query.where(key, '==', value);
        }
      });
      if (filter.createdAt) {
        if (filter.createdAt.$gte) query = query.where('createdAt', '>=', filter.createdAt.$gte);
        if (filter.createdAt.$lte) query = query.where('createdAt', '<=', filter.createdAt.$lte);
      }
      const snapshot = await query.count().get();
      return snapshot.data().count;
    } catch (error) {
      throw error;
    }
  },

  deleteMany: async (filter = {}) => {
    try {
      let query = Log.collection();
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && key !== 'createdAt' && typeof value !== 'object') {
          query = query.where(key, '==', value);
        }
      });
      if (filter.createdAt) {
        if (filter.createdAt.$lt) query = query.where('createdAt', '<', filter.createdAt.$lt);
      }

      const snapshot = await query.get();
      const docs = filter.severity?.$ne
        ? snapshot.docs.filter((doc) => doc.data().severity !== filter.severity.$ne)
        : snapshot.docs;
      const batch = getFirestore().batch();
      docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      return { deletedCount: docs.length };
    } catch (error) {
      throw error;
    }
  },

  aggregate: async (pipeline) => {
    // Simplified aggregation - Firestore doesn't have full aggregation pipeline
    // This returns raw data that can be processed
    try {
      const snapshot = await Log.collection().get();
      return snapshot.docs.map((doc) => ({ _id: doc.id, ...doc.data() }));
    } catch (error) {
      throw error;
    }
  },
};

module.exports = Log;
