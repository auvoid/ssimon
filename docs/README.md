# Developer Documentation

SSIMON relies on a plug and play adapter based system for DID and VC based operations, SSIMON proposes what all methods an adapter must implement in order for an adapter to be compatible with the SSIMON ecosystem.

TangleLabs currently has two Adapters which are fully SSIMON compatible

### Current Adapter Ecosystem

| Adapter                                                                                              | Method     |
| ---------------------------------------------------------------------------------------------------- | ---------- |
| [@tanglelabs/iota-identity-adapter](https://www.npmjs.com/package/@tanglelabs/iota-identity-adapter) | `did:iota` |
| [@tanglelabs/key-identity-adapter](https://www.npmjs.com/package/@tanglelabs/key-identity-adapter)   | `did:key`  |
| [@tanglelabs/web-identity-adapter](https://www.npmjs.com/package/@tanglelabs/web-identity-adapter)   | `did:web`  |

When initialising SSIMON you can plug any of these adapters into the builder and it would allow you to deal with that method in particular.

## Guides

1. [Getting Started](examples/1.md)
2. [Managing Identity Accounts](examples/2.md)
3. [Managing Credentials](examples/3.md)
