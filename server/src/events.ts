import { EventEmitter } from "events";
import type { AppEvent } from "./types.js";

class TypedEmitter extends EventEmitter {
  emitApp(event: AppEvent) {
    this.emit(event.type, event);
    this.emit("*", event);
  }

  onApp<T extends AppEvent["type"]>(
    type: T,
    handler: (event: Extract<AppEvent, { type: T }>) => void
  ) {
    this.on(type, handler);
  }
}

export const appEvents = new TypedEmitter();
appEvents.setMaxListeners(50);
