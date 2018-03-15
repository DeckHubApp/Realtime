namespace Slidable.Hub {
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

    const groupName = window.location.pathname.replace("/live/", "").replace(/\/[0-9]+$/, "");

    const transport = signalR.TransportType.WebSockets;
    const logger = new signalR.ConsoleLogger(signalR.LogLevel.Information);

    const onConnectedCallbacks: Function[] = [];
    const onDisconnectedCallbacks: Function[] = [];

    function connected() {
        for (const callback of onConnectedCallbacks) {
            try {
                callback();
            } catch (e) {
                console.error(e);
            } 
        }
    }

    function disconnected() {
        for (const callback of onDisconnectedCallbacks) {
            try {
                callback();
            } catch (e) {
                console.error(e);
            } 
        }
    }

    export var hubConnection: signalR.HubConnection | null = null;

    export function onConnected(callback: Function) {
        onConnectedCallbacks.push(callback);
        if (hubConnection !== null) {
            callback();
        }
    }

    export function onDisconnected(callback: Function) {
        onDisconnectedCallbacks.push(callback);
    }

    export function connect() {
        hubConnection = new signalR.HubConnection("/hub/live", { transport, logger });
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
                hubConnection.invoke("Join", groupName);
                connected();
            })
            .catch(console.error);
    }
}