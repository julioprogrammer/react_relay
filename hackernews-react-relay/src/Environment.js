import { GC_AUTH_TOKEN } from './constants'
import { SubscriptionClient } from 'subscriptions-transport-ws'
import { requestAPI } from './utils'
// 1
const {
  Environment,
    Network,
    RecordSource,
    Store,
} = require('relay-runtime')

// 2
const store = new Store(new RecordSource())

// 3
const fetchQuery = (operation, variables) => {
    return requestAPI(operation, variables, GC_AUTH_TOKEN)
}

const setupSubscription = (config, variables, cacheConfig, observer) => {
    const query = config.text

    const subscriptionClient = new SubscriptionClient('wss://subscriptions.graph.cool/v1/cj7nivq5z0mph0122v4r35u00', { reconnect: true })
    subscriptionClient.subscribe({ query, variables }, (error, result) => {
        observer.onNext({ data: result })
    })
}

const network = Network.create(fetchQuery, setupSubscription)

// 5
const environment = new Environment({
    network,
    store,
})

// 6
export default environment