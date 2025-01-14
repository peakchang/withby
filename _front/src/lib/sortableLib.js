export function measurePositions() {
    const elements = document.querySelectorAll("li");
    positions = new Map(
        Array.from(elements).map((el) => [
            el.dataset.key,
            el.getBoundingClientRect(),
        ]),
    );
}