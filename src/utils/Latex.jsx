import { createSignal, onCleanup, createEffect } from "solid-js";
import katex from "katex";

export default function Latex(props) {
    let container;
    const [content, _] = createSignal(props.children);

    const displayMode = (props.displayMode == "true") ?? false;
    createEffect(() => {
        katex.render(content(), container, {
            throwOnError: false,
            displayMode: displayMode,
        });
    });

    onCleanup(() => {
        container.innerHTML = '';
    });

    return <span class="text-lg" ref={container} />;
}
