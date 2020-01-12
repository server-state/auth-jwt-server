export interface SWTServerConfig {
    privateKey?: string;
    publicKey?: string;

    issuerName: string;

    getUsersGroups(username: string): string[];
    authenticate(username: string, password: string): Promise<boolean>;

}
