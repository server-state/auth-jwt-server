import JWTServer from '.';

describe('back and forth', () => {
    it('should encode', async () => {
        const server = new JWTServer({
            async authenticate(username: string, password: string): Promise<boolean> {
                return true;
            }, issuerName: "", getUsersGroups(username: string): string[] {
                return ['admin'];
            }
        });

        const encryped = await server.authenticate('Mike', 'delta');
        const groups = server.getAuthorizedGroups(encryped);
        const unauthorized = server.getAuthorizedGroups('jfowjef');

        expect(encryped).toBeTruthy();
        expect(groups).toContainEqual('admin');
        expect(unauthorized).not.toContainEqual('admin');

    })
});
