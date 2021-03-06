const {makeExecutableSchema} = require('graphql-tools');
const resolvers = require('./resolvers');

// Define your types here.
const typeDefs = `
  type Link {
    id: ID!
    url: String!
    description: String!
    postedBy: User
    votes: [Vote!]!
    createdAt: Float!
  }

  type User {
    id: ID!
    name: String!
    email: String
    password: String
    votes: [Vote!]!
  }

  input AuthProviderSignupData {
    email: AUTH_PROVIDER_EMAIL
  }

  input AUTH_PROVIDER_EMAIL {
    email: String!
    password: String!
  }

  type SigninPayload {
    token: String
    user: User
  }

  type Vote {
    id: ID!
    user: User!
    link: Link!
  }

  type Query {
    allLinks(filter: LinkFilter, skip: Int, first: Int): [Link!]!
    allUsers: [User!]!
  }

  type Mutation {
    createLink(url: String!, description: String!, postedById: ID!): Link
    createVote(linkId: ID!, userId: ID!): Vote
    createUser(name: String!, authProvider: AuthProviderSignupData!): User
    signinUser(email: AUTH_PROVIDER_EMAIL): SigninPayload!
  }

  type Subscription {
    Link(filter: LinkSubscriptionFilter): LinkSubscriptionPayload
    Vote(filter: VoteSubscriptionFilter): VoteSubscriptionPayload
    User(filter: UserSubscriptionFilter): UserSubscriptionPayload
  }

  input LinkFilter {
    OR: [LinkFilter!]
    description_contains: String
    url_contains: String
  }

  input VoteSubscriptionFilter {
    mutation_in: [_ModelMutationType!]
  }

  type VoteSubscriptionPayload {
    mutation: _ModelMutationType!
    node: Vote
  }

  input UserSubscriptionFilter {
    mutation_in: [_ModelMutationType!]
  }

  type UserSubscriptionPayload {
    mutation: _ModelMutationType!
    node: User
  }

  input LinkSubscriptionFilter {
    mutation_in: [_ModelMutationType!]
  }

  type LinkSubscriptionPayload {
    mutation: _ModelMutationType!
    node: Link
  }

  enum _ModelMutationType {
    CREATED
    UPDATED
    DELETED
  }

`;

// Generate the schema object from your types definition.
module.exports = makeExecutableSchema({ typeDefs, resolvers });
