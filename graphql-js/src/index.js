const express = require('express');
const bodyParser = require('body-parser');
const {graphqlExpress, graphiqlExpress} = require('apollo-server-express');
const schema = require('./schema');
const {authenticate} = require('./authentication');
const buildDataloaders = require('./dataloaders');
const formatError = require('./formatError');
const { execute, subscribe } = require('graphql');
const { createServer } = require('http');
const { SubscriptionServer } = require('subscriptions-transport-ws');


// 1
const connectMongo = require('./mongo-connector');

const PORT = 3000;

// 2
const start = async () => {
  // 3
  const mongo = await connectMongo();
  var app = express();
 const buildOptions = async (req, res) => {
    const user = await authenticate(req, mongo.Users);
    return {
      context: {
        dataloaders: buildDataloaders(mongo),
        mongo, 
        user
      }, // This context object is passed to all resolvers.
      formatError,
      schema,
    };
  };
  app.use('/graphql', bodyParser.json(), graphqlExpress(buildOptions));
  app.use('/graphiql', graphiqlExpress({
    endpointURL: '/graphql',
    passHeader: `'Authorization': 'bearer token-julioreiddt@hotmail.com'`,
    subscriptionsEndpoint: `ws://localhost:${PORT}/subscriptions`,
  }));

  const server = createServer(app);
  server.listen(PORT, () => {
    SubscriptionServer.create(
      { execute, subscribe, schema },
      { server, path: '/subscriptions' },
    );
    console.log(`Hackernews GraphQL server running on port ${PORT}.`)
  });

};

// 5
start();