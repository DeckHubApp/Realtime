declare namespace DeckHub {
    const show: string | null;
}

namespace DeckHub.Hub {

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

    let _connected = false;

    export function subject<T>(name: string) {
        if (!subjects.has(name)) {
            const subject = new rxjs.Subject<T>();
            subjects.set(name, subject);
            if (_connected) {
                hubConnection.on(name, (data) => {
                    console.log(data);
                    subject.next(data as T);
                });
            }
            return subject;
        }
        return subjects.get(name) as rxjs.Subject<T>;
    }

    function attachCallbacks() {
        _connected = true;
        subjects.forEach((subject, key) => {
            hubConnection.on(key, (data) => {
                console.log(data);
                subject.next(data);
            });
        });
    }

    function disconnected() {
        _connected = false;
    }

    export var hubConnection: signalR.HubConnection | null = null;

    function connect() {
        var groupName = DeckHub.show || getGroupName();
        if (!groupName) return;
        hubConnection = new signalR.HubConnectionBuilder()
            .withUrl('/hub/live')
            .configureLogging(signalR.LogLevel.Information)
            .build();
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
        attachCallbacks();
        hubConnection.start()
            .then(() => {
                hubConnection.invoke('Join', groupName);
            })
            .catch(console.error);
    }

    document.addEventListener('DOMContentLoaded', connect);
}

declare namespace signalR {

    export class HubConnectionBuilder {
        constructor();
        
        withUrl(url: string): HubConnectionBuilder;
        
        configureLogging(level: LogLevel): HubConnectionBuilder;

        build(): HubConnection;
    }
    
    export class HubConnection {
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

declare namespace rxjs {

    export class Observable<T> {
        
    }

    export class Subject<T> extends Observable<T> {
        public next(value?: T): void;
    }
}