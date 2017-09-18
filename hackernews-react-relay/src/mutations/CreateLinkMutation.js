// 1
import {
    commitMutation,
    graphql,
} from 'react-relay'
import { ConnectionHandler } from 'relay-runtime'
import environment from '../Environment'

// 2
const mutation = graphql`
  mutation CreateLinkMutation($input: CreateLinkInput!) {
    createLink(input: $input) {
      link {
        id
        createdAt
        url
        description
        postedBy {
          id
          name
        }
      }
    }
  }
`

// 3
export default (postedById, description, url, callback) => {
    // 4
    const variables = {
        input: {
            postedById,
            description,
            url,
            clientMutationId: ""
        },
    }

    // 5
    commitMutation(
        environment,
        {
            mutation,
            variables,
            // 6
            onCompleted: () => {
                callback()
            },
            onError: err => console.error(err),
        },
    )
}