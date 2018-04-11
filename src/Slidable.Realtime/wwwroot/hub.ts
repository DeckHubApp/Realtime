namespace Slidable.Hub {

    const subjects = new Map();

    function getGroupName() {
        const parts = window.location.pathname.split('/').filter(s => !!s);
        if (parts.length < 4) return null;
        parts.pop(); // Should be the slide number, we don't care
        const slug = parts.pop();
        const presenter = parts.pop();
        const place = parts.pop();
        return `${place}/${presenter}/${slug}`;
    }

    const transport = signalR.TransportType.WebSockets;
    const logger = new signalR.ConsoleLogger(signalR.LogLevel.Information);

    const onConnectedCallbacks: Function[] = [];
    const onDisconnectedCallbacks: Function[] = [];

    let _connected = false;

    export function subject<T>(name: string) {
        if (!subjects.has(name)) {
            const subject = new Rx.Subject<T>();
            subjects.set(name, new Rx.Subject<T>());
            if (_connected) {
                hubConnection.on(name, subject.next);
            }
            return subject;
        }
        return subjects.get(name) as Rx.Subject<T>;
    }

    function connected() {
        _connected = true;
        subjects.forEach((subject, key) => {
            hubConnection.on(key, subject.next);
        });
    }

    function disconnected() {
        _connected = false;
    }

    export var hubConnection: signalR.HubConnection | null = null;

    function connect() {
        var groupName = getGroupName();
        if (!!groupName) return;
        hubConnection = new signalR.HubConnection('/hub/live', { transport, logger });
        hubConnection.onclose(e => {
            if (e) {
                console.error(e.message);
                hubConnection = null;
                disconnected();
                // Try to reconnect in 10 seconds
                setTimeout(connect, 10000);
            } else {
                disconnected();
            }
        });
        hubConnection.start()
            .then(() => {
                hubConnection.invoke('Join', groupName);
                connected();
            })
            .catch(console.error);
    }

    document.addEventListener('DOMContentLoaded', connect);
}

declare namespace signalR {

    export class HubConnection {
        constructor(path: string, options: any);

        on<T>(method: string, action: (data: T) => void): void;

        onclose(callback: ConnectionClosed): void;

        invoke(method: string, data: any);

        start(): Promise<any>;
    }

    export type ConnectionClosed = (e?: Error) => void;

    export enum TransportType {
        WebSockets
    }

    export enum LogLevel {
        Information,
        Debug
    }

    export class ConsoleLogger {
        constructor(logLevel: LogLevel);
    }
}

declare namespace Rx {

    export class Observable<T> {
        
    }

    export class Subject<T> extends Observable<T> {
        public next(value?: T): void;
    }
}