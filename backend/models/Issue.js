const { getFirestore } = require('../config/firebase');

const collectionName = 'issues';

const Issue = {
  collection: () => getFirestore().collection(collectionName),

  create: async (data) => {
    try {
      const timestamp = new Date();
      const docRef = await Issue.collection().add({
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
      let query = Issue.collection();
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && typeof value !== 'object') {
          query = query.where(key, '==', value);
        }
      });
      const snapshot = await query.get();
      return snapshot.docs.map((doc) => ({ _id: doc.id, ...doc.data() }));
    } catch (error) {
      throw error;
    }
  },

  findWithPagination: async (filter = {}, page = 1, limit = 10, sortBy = 'createdAt', order = 'desc') => {
    try {
      let query = Issue.collection();
      
      // Apply filters
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && typeof value !== 'object') {
          query = query.where(key, '==', value);
        }
      });

      // Apply sorting
      const sortOrder = order === 'asc';
      query = query.orderBy(sortBy, sortOrder ? 'asc' : 'desc');

      // Get total count
      const countSnapshot = await query.count().get();
      const total = countSnapshot.data().count;

      // Apply pagination
      const skip = (page - 1) * limit;
      const snapshot = await query.offset(skip).limit(parseInt(limit)).get();
      const issues = snapshot.docs.map((doc) => ({ _id: doc.id, ...doc.data() }));

      return {
        issues,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
        count: issues.length,
      };
    } catch (error) {
      throw error;
    }
  },

  findById: async (id) => {
    try {
      const doc = await Issue.collection().doc(id).get();
      return doc.exists ? { _id: doc.id, ...doc.data() } : null;
    } catch (error) {
      throw error;
    }
  },

  update: async (id, data) => {
    try {
      data.updatedAt = new Date();
      await Issue.collection().doc(id).update(data);
      const doc = await Issue.collection().doc(id).get();
      return doc.exists ? { _id: doc.id, ...doc.data() } : null;
    } catch (error) {
      throw error;
    }
  },

  findByIdAndDelete: async (id) => {
    try {
      const doc = await Issue.collection().doc(id).get();
      if (!doc.exists) return null;
      await Issue.collection().doc(id).delete();
      return { _id: doc.id, ...doc.data() };
    } catch (error) {
      throw error;
    }
  },

  countDocuments: async (filter = {}) => {
    try {
      let query = Issue.collection();
      Object.entries(filter).forEach(([key, value]) => {
        if (value !== undefined && value !== null && typeof value !== 'object') {
          query = query.where(key, '==', value);
        }
      });
      const snapshot = await query.count().get();
      return snapshot.data().count;
    } catch (error) {
      throw error;
    }
  },

  search: async (query) => {
    try {
      const snapshot = await Issue.collection().get();
      const allIssues = snapshot.docs.map((doc) => ({ _id: doc.id, ...doc.data() }));
      const lowerQuery = query.toLowerCase();
      return allIssues.filter(
        (issue) =>
          issue.title?.toLowerCase().includes(lowerQuery) ||
          issue.category?.toLowerCase().includes(lowerQuery) ||
          issue.city?.toLowerCase().includes(lowerQuery) ||
          issue.state?.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      throw error;
    }
  },
};

module.exports = Issue;