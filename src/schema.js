import { gql } from "apollo-server";

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    password: String!
    cards: [Card]
  }

  type Card {
    id: ID!
    title: String!
    content: String!
    user: User!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type Query {
    users: [User]
    userCards: [Card]
    userCardById(id: ID!): Card
  }

  type Mutation {
    register(username: String!, password: String!): User
    login(username: String!, password: String!): AuthPayload
    createCard(title: String!, content: String!): Card
    updateCard(id: ID!, title: String, content: String): Card
    deleteCard(id: ID!): Card
  }
`;

export default typeDefs;
