const { AuthenticationError } = require('apollo-server')
const Pin = require('./models/Pin')

//* a Higher-Order-Function that will wrap all resolver functions. Checks there is a verified user on context. If so, returns the resolver function it wrapped, otherwise throws an Error.
const authenticated = resolverFunc => (root, args, ctx, info) => {
  if (!ctx.currentUser) {
    throw new AuthenticationError('You must be logged in')
  }
  return resolverFunc(root, args, ctx, info)
}

module.exports = {
  Query: {
    me: authenticated((root, args, ctx) => ctx.currentUser),
  },
  Mutation: {
    createPin: authenticated(async (root, args, ctx) => {
      const newPin = await new Pin({
        ...args.input,
        author: ctx.currentUser._id
      }).save()
      const pinAdded = await Pin.populate(newPin, 'author')
      return pinAdded
    })
  }
}