import JWTServer from '.';
// @ts-ignore
import Express, {RequestMock, ResponseMock} from '../tests/express.mock';

describe('JWTServer', () => {
    let jwtServer: JWTServer;

    beforeEach(() => {
        jwtServer = new JWTServer({
            async authenticate(username: string, password: string): Promise<boolean> {
                return username === 'user' && password === 'password';
            }, issuerName: "", async getUsersGroups(username: string): Promise<string[]> {
                return username === 'user' ? ['admin'] : [];
            }
        });
    });

    it('should encode and decode the JWT token', async () => {

        const encryped = await jwtServer.authenticate('user', 'password');
        const groups = await jwtServer.getAuthorizedGroups(encryped);
        const unauthorized = await jwtServer.getAuthorizedGroups('jfowjef');

        expect(encryped).toBeTruthy();
        expect(groups).toContainEqual('admin');
        expect(unauthorized).not.toContainEqual('admin');
    });

    describe('Express App Setup', () => {
        let express: any;
        let response: ResponseMock;

        beforeEach(() => {
            express = new Express();
            response = new ResponseMock();
            jwtServer.setup(express, '/auth')
        });

        it('should correctly setup the route', () => {
            expect(express.url).toBe('/auth');
        });

        it('should correctly deny access to unauthorized users', async () => {
            await express.cb(new RequestMock({username: 'notauser', password: 'abc'}), response);

            expect(response.status).toBe(401);
        });

        it('should return Bad Request if body isn\'t valid', async () => {
            await express.cb(new RequestMock({username: 'notauser'}), response);

            expect(response.status).toBe(400);
        });

        it('should return the JWT token if the user is valid', async () => {
            await express.cb(new RequestMock({username: 'user', password: 'password'}), response);

            expect(response.status).toBe(200);
            expect(
                await jwtServer.getAuthorizedGroups(
                    JSON.parse(response.body)
                )
            ).toContainEqual('admin');

        })
    })
});

