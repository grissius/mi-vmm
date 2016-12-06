import convert from 'color-convert';

export function rgbL2(colora, colorb) {
    var sum = Math.pow(colora.r-colorb.r, 2) + Math.pow(colora.g-colorb.g, 2) + Math.pow(colora.b-colorb.b, 2);
    return Math.sqrt(sum);
}

export function delta(colora, colorb) {
    const lab1 = convert.rgb.lab([colora.r, colora.g, colora.b]);
}