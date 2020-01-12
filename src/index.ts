import {SWTServerConfig} from "./SWTServerConfig";
import {JWTPayload} from "./JWTPayload";
import jwt, {Secret} from 'jsonwebtoken';
import {generate} from 'selfsigned';

/**
 * A basic JWT Server and Client implementation that can get used in the server-state ecosystem
 *
 * @copyright server-state
 * @author Pablo Klaschka
 */
export default class SWTServer {
    /**
     * The public key the server uses to decrypt a JWT payload token.
     */
    public readonly publicKey: Secret;
    /**
     * The private key the server uses to encrypt a JWT payload token.
     */
    private readonly privateKey: Secret;

    constructor(private config: SWTServerConfig) {
        if (config.privateKey && config.publicKey) {
            this.privateKey = config.privateKey;
            this.publicKey = config.publicKey;
        } else {
            // Generate keys
            const generated = generate();
            this.privateKey = generated.private;
            this.publicKey = generated.public;
        }
    }

    /**
     * Sets up a token fetching route in a passed Express app
     * @param router express app/Router in which the path should get set up
     * @param authURL path of the token fetching endpoint, relative from Routers route
     */
    public setup(router: import('express').IRouter, authURL: string): void {
        router.post(authURL, async (req, res: import('express').Response) => {
            const username = req.body.username;
            const password = req.body.password;

            if (!username || !password) {
                return res.sendStatus(400);
            }
            try {
                const token = await this.authenticate(username, password);
                return res.json(token);
            } catch (e) {
                return res.sendStatus(401);
            }
        });
    }

    /**
     * Encodes a JWT payload
     * @param payload decoded JWT payload
     * @returns encoded JWT payload
     */
    private encode(payload: JWTPayload): string {
        return jwt.sign(payload, this.privateKey, {
            issuer: this.config.issuerName,
            algorithm: 'RS256'
        });
    }

    /**
     * Decodes an encoded JWT token
     * @param encoded encoded JWT token
     * @returns decoded JWT payload
     */
    private decode(encoded: string): JWTPayload {
        return jwt.verify(encoded, this.publicKey, {
            issuer: this.config.issuerName,
            algorithms: ['RS256']
        }) as JWTPayload;
    }

    /**
     * Authenticates a user and resolves with his JWT token
     * @param username user's username
     * @param password user's password
     * @throws if the user is unauthorized
     */
    public async authenticate(username: string, password: string): Promise<string> {
        // If !authenticated, throw => reject
        if (!await this.config.authenticate(username, password))
            throw new Error('Unauthorized');

        // Otherwise, generate token and return
        return this.encode({
            user: username
        });
    }

    /**
     * Checks the authorized groups of the current user
     * @param jwtToken The JWT Payload Token
     * @returns the authorized groups. `['guest']`, if no groups apply
     */
    public async getAuthorizedGroups(jwtToken: string): Promise<string[]> {
        try {
            const jwt = this.decode(jwtToken);

            let authorizedGroups: string[] = (jwt && jwt.user) ?
                await this.config.getUsersGroups(jwt.user) :
                ['guest'];

            if (authorizedGroups.length > 0) {
                return authorizedGroups;
            } else {
                return ['guest'];
            }
        } catch (e) {
            return ['guest'];
        }
    }
}
