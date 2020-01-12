import {SWTServerConfig} from "./SWTServerConfig";
import {JWTPayload} from "./JWTPayload";
import jwt, {Secret} from 'jsonwebtoken';
import {generate} from 'selfsigned';

export default class SWTServer {
    private readonly publicKey: Secret;
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

    public setup(express: import('express').IRouter, authURL: string): void {
        express.post(authURL, async (req, res: import('express').Response) => {
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

    private encode(value: JWTPayload): string {
        return jwt.sign(value, this.privateKey, {
            issuer: this.config.issuerName,
            algorithm: 'RS256'
        });
    }

    private decode(encoded: string): JWTPayload {
        return jwt.verify(encoded, this.publicKey, {
            issuer: this.config.issuerName,
            algorithms: ['RS256']
        }) as JWTPayload;
    }

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
    public getAuthorizedGroups(jwtToken: string): string[] {
        try {
            const jwt = this.decode(jwtToken);

            let authorizedGroups: string[] = (jwt && jwt.user) ?
                this.config.getUsersGroups(jwt.user) :
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
