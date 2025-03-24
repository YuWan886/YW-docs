interface ServerDebug {
    ping: number;
}

interface ServerStatus {
    online: boolean;
    ip: string;
    port: number;
    hostname: string;
    version: string;
    protocol: number;
    players: {
        online: number;
        max: number;
        list: string[];
    };
    motd: {
        raw: string[];
        clean: string[];
        html: string[];
    };
    icon: string;
    ping: number;
    debug?: ServerDebug;
} 