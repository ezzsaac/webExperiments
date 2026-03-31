export async function loadShaders(paths) {
    const sources = await Promise.all(
        paths.map(p => fetch(p).then(r => r.text()))
    )
    return sources
}
