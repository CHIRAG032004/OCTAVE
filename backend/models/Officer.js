const { getFirestore } = require('../config/firebase');

const collectionName = 'officers';

const Officer = {
  collection: () => getFirestore().collection(collectionName),

  create: async (data) => {
    try {
      const timestamp = new Date();
      const docRef = await Officer.collection().add({
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
      let query = Officer.collection();
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && key !== 'createdAt') {
          if (key === 'assignedLocations') {
            // For array contains, use array-contains
            query = query.where(key, 'array-contains', value);
          } else {
            query = query.where(key, '==', value);
          }
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

  findById: async (id) => {
    try {
      const doc = await Officer.collection().doc(id).get();
      return doc.exists ? { _id: doc.id, ...doc.data() } : null;
    } catch (error) {
      throw error;
    }
  },

  findOne: async (filter) => {
    try {
      const docs = await Officer.find(filter);
      return docs.length > 0 ? docs[0] : null;
    } catch (error) {
      throw error;
    }
  },

  findByIdAndUpdate: async (id, updates) => {
    try {
      updates.updatedAt = new Date();
      await Officer.collection().doc(id).update(updates);
      const doc = await Officer.collection().doc(id).get();
      return doc.exists ? { _id: doc.id, ...doc.data() } : null;
    } catch (error) {
      throw error;
    }
  },

  findByIdAndDelete: async (id) => {
    try {
      const doc = await Officer.collection().doc(id).get();
      if (!doc.exists) return null;
      await Officer.collection().doc(id).delete();
      return { _id: doc.id, ...doc.data() };
    } catch (error) {
      throw error;
    }
  },
};

module.exports = Officer;
