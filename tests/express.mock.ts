export default class Express {
    public url?: string;
    public cb?: (req: any, res: any) => any;

    public post(url: string, cb: any) {
        this.url = url;
        this.cb = cb;
    }
}

export class RequestMock {
    constructor(public body: object) {
    }
}

export class ResponseMock {
    public body: any;
    public status: number = 200;

    public json(body: ServerState.JSONSerializable) {
        this.body = JSON.stringify(body);
    }

    public sendStatus(status: number) {
        this.status = status;
    }
}
