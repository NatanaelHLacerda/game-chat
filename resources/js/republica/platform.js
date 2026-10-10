// Plataforma para textos de ajuda; o iPad se apresenta como "Macintosh" com toque.
export function platformOf(userAgent = '', maxTouchPoints = 0) {
    if (/iPhone|iPad|iPod/.test(userAgent) || (/Macintosh/.test(userAgent) && maxTouchPoints > 1)) return 'ios';
    if (/Android/.test(userAgent)) return 'android';
    return 'desktop';
}
