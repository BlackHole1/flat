import * as runtime from "../runtime";

export type WindowActionAsync = {
    "set-win-size": (args: { width: number; height: number; autoCenter?: boolean }) => void;
    "disable-window": (args: { disable: boolean }) => void;
    "set-title": (args: { title: string }) => void;
};

export type AppActionAsync = {
    "set-open-at-login": (args: { isOpenAtLogin: boolean }) => void;
};

export type AppActionSync = {
    "get-runtime": () => runtime.Type;
    "get-open-at-login": () => boolean;
};

export interface EmitEvents {
    "window-will-close": {};
}