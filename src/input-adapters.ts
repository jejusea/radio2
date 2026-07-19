export type ReceiverCommand = "PREVIOUS_VIDEO" | "NEXT_VIDEO" | "PREVIOUS_RADIO" | "NEXT_RADIO";
export interface InputAdapter { connect(dispatch: (command: ReceiverCommand) => void): () => void }
export class LocalWebSocketAdapter implements InputAdapter {
  constructor(private url = "ws://127.0.0.1:8765") {}
  connect(dispatch: (command: ReceiverCommand) => void) {
    const socket = new WebSocket(this.url);
    socket.addEventListener("message", (event) => {
      const command = String(event.data) as ReceiverCommand;
      if (["PREVIOUS_VIDEO", "NEXT_VIDEO", "PREVIOUS_RADIO", "NEXT_RADIO"].includes(command)) dispatch(command);
    });
    return () => socket.close();
  }
}
