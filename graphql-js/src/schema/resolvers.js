const { ObjectID } = require('mongodb');
const pubsub = require('../pubsub');

const { URL } = require('url');

function assertValidLink({ url }) {
  try {
    new URL(url);
  } catch (error) {
    throw new Error('Link validation error: invalid url.');
  }
}

function buildFilters({ OR = [], description_contains, url_contains }) {
  const filter = (description_contains || url_contains) ? {} : null;
  if (description_contains) {
    filter.description = { $regex: `.*${description_contains}.*` };
  }
  if (url_contains) {
    filter.url = { $regex: `.*${url_contains}.*` };
  }

  let filters = filter ? [filter] : [];
  for (let i = 0; i < OR.length; i++) {
    filters = filters.concat(buildFilters(OR[i]));
  }
  return filters;
}

class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.field = field;
  }
}

function assertValidLink({ url }) {
  try {
    new URL(url);
  } catch (error) {
    throw new ValidationError('Link validation error: invalid url.', 'url');
  }
}

module.exports = {
  Query: {

    allLinks: async (root, { filter, first, skip }, { mongo: { Links, Users } }) => {
      let query = filter ? { $or: buildFilters(filter) } : {};
      const cursor = Links.find(query)
      if (first) {
        cursor.limit(first);
      }
      if (skip) {
        cursor.skip(skip);
      }
      return cursor.toArray();
    },

    allUsers: async (root, data, {mongo: {Users}}) => {
      return await Users.find({}).toArray();
    }

  },

  Mutation: {

    createLink: async (root, data, { mongo: { Links }, user }) => {
      assertValidLink(data);
      const newLink = Object.assign({ postedById: user && user._id }, data)
      const response = await Links.insert(newLink);

      newLink.id = response.insertedIds[0]
      pubsub.publish('Link', { Link: { mutation: 'CREATED', node: newLink } });

      return newLink;
    },

    createUser: async (root, data, {mongo: {Users}}) => {
      const newUser = {
          name: data.name,
          email: data.authProvider.email.email,
          password: data.authProvider.email.password,
      };
      const response = await Users.insert(newUser);

      newUser.id = response.insertedIds[0]
      pubsub.publish('User', { User: { mutation: 'CREATED', node: newUser } });

      return newUser;
    },

    signinUser: async (root, data, {mongo: {Users}}) => {
      const user = await Users.findOne({email: data.email.email});
      if (data.email.password === user.password) {
        return {token: `token-${user.email}`, user};
      }
    },

    createVote: async (root, data, { mongo: { Votes }, user }) => {
      const newVote = {
        userId: user && user._id,
        linkId: new ObjectID(data.linkId),
      };
      const response = await Votes.insert(newVote);
      
      newVote.id = response.insertedIds[0]
      pubsub.publish('Vote', { Vote: { mutation: 'CREATED', node: { newVote } } });

      return newVote;
    },

  },

  Subscription: {

    Link: {
      subscribe: () => pubsub.asyncIterator('Link'),
    },

    Vote: {
      subscribe: () => pubsub.asyncIterator('Vote'),
    },

    User: {
      subscribe: () => pubsub.asyncIterator('User'),
    },

  },

  User: {
    // Convert the "_id" field from MongoDB to "id" from the schema.
    id: root => root._id || root.id,
    votes: async ({ _id }, data, { mongo: { Votes } }) => {
      return await Votes.find({ userId: _id }).toArray();
    },
  },

  Link: {
    id: root => root._id || root.id, // 5
    postedBy: async ({postedById}, data, {mongo: {Users}}) => {
        return await Users.findOne({_id: postedById});
    },
    votes: async ({ _id }, data, { mongo: { Votes } }) => {
      return await Votes.find({ linkId: _id }).toArray();
    },
    postedBy: async ({ postedById }, data, { dataloaders: { userLoader } }) => {
      return await userLoader.load(postedById);
    },
  },

  Vote: {
    id: root => root._id || root.id,

    user: async ({ userId }, data, { mongo: { Users } }) => {
      return await Users.findOne({ _id: userId });
    },

    link: async ({ linkId }, data, { mongo: { Links } }) => {
      return await Links.findOne({ _id: linkId });
    },
    user: async ({ userId }, data, { dataloaders: { userLoader } }) => {
      return await userLoader.load(userId);
    },
  },
};