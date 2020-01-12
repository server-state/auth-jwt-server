declare module 'selfsigned' {
    export function generate(): {private: string, public: string};
}
