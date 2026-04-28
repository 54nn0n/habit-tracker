import { useSyncExternalStore } from "react";
import {
  subscribeToLogs,
  getLogsSnapshot,
  getServerLogsSnapshot,
  type AllLogs,
} from "./storage";

export function useLogs(): AllLogs {
  return useSyncExternalStore(
    subscribeToLogs,
    getLogsSnapshot,
    getServerLogsSnapshot,
  );
}
