import convert from 'color-convert';

export function rgbL2(colora, colorb) {
    var sum = Math.pow(colora[0]-colorb[0], 2) + Math.pow(colora[1]-colorb[1], 2) + Math.pow(colora[2]-colorb[2], 2);
    return Math.sqrt(sum);
}

export function delta(colora, colorb) {
    const lab1 = convert.rgb.lab([colora.r, colora.g, colora.b]);
}