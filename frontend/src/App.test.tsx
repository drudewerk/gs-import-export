// @vitest-environment jsdom

import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, expect, test } from "vitest";

import App from "./App";


class GoogleScriptRunFake {
    private successHandler?: (result: CurrentState) => void;

    withSuccessHandler(callback: (result: CurrentState) => void) {
        this.successHandler = callback;
        return this;
    }

    withFailureHandler() {
        return this;
    }

    getCurrentState() {
        this.successHandler?.({
            state: "export",
        });
    }
}

let container: HTMLDivElement;
let root: Root | undefined;

beforeEach(() => {
    container = document.createElement("div");
    container.id = "root";
    document.body.append(container);
    root = createRoot(container);

    Object.defineProperty(globalThis, "google", {
        configurable: true,
        value: {
            script: {
                run: new GoogleScriptRunFake(),
            },
        },
    });
});

afterEach(async () => {
    if (root) {
        await act(async () => {
            root?.unmount();
        });
    }
    container.remove();
});

test("renders the export sidebar", async () => {
    await act(async () => {
        root?.render(<App />);
    });

    expect(container.textContent).toContain("Export from");
    expect(container.textContent).toContain("Export");
});

test("changes the export source", async () => {
    await act(async () => {
        root?.render(<App />);
    });

    const selection = [...container.querySelectorAll<HTMLElement>("[role=radio]")]
        .find((radio) => radio.textContent?.includes("Current selection"));

    expect(selection).toBeDefined();

    await act(async () => {
        selection?.click();
    });

    expect(selection?.getAttribute("aria-checked")).toBe("true");
});
