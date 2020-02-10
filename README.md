# auth-jwt-server
Basic JWT server for Server State servers (cf. https://github.com/server-state/simple-server)

## Usage
### Installing and importing the module

Install the server with `npm install @server-state/auth-jwt-server` and import it with

```js
const JWT = require('@server-state/auth-jwt-server');
```

### Instantiating the JWT server instance
`JWT` is now an imported class. Therefore, you can use 

```js
const jwtServer = new JWT(config);
```

to instantiate a new instance to use with your server.

#### Config
The config consists of multiple required and optional fields:

##### Required `config` fields
- `issuerName: string` - the name of the token's issuer. Required for multi-server setups
- `getUsersGroups: (username: string) => Promise<string[]>` - a function that determines (and resolves with an array of) the user groups the passed user has access to.
- `authenticate: (username: string, password: string) => Promise<boolean>` - a function that checks users credentials. Returns a `Promise<boolean>` that resolves to `true` if the credentials are valid and `false` if they are not.

##### Optional `config` fields
- `privateKey: string` - the RS256 private key. Gets generated if none is provided; If provided, `publicKey` becomes a required field.
- `publicKey: string` - the RS256 public key. Gets generated if none is provided; If provided, `privateKey` becomes a required field.

### Setting up the authentication route
Use

```js
jwt.setup(router, '/auth/jwt');
```

where `router` is your express router to set up the route `/auth/jwt` as API endpoint for authentication (use .

This sets up

```http
POST /auth/jwt
```

which returns a JSON string of the users token on success, `HTTP 401` if the credentials couldn't be verified and `HTTP 400` if either `username` or `password` weren't specified in the body.

### Using the auth module in your server
To finally use the module in your server, you need to access it in your `ServerBase` config's `isAuthorized`. This is very dependent on your personal setup, but one basic example could look something like this:

```js
isAuthorized: (req, authorizedGroups) => {
  const currentUsersGroups = jwt.getAuthorizedGroups(req.header('Authorization'));
  
  for (const group of authorizedGroups) {
    if (group === 'guest' || currentUsersGroups.includes(group)) {
      return true;
    }
  }
  
  return false;
}
```
