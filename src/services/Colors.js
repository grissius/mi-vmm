import convert from 'color-convert';
import _ from 'lodash';

function l2(a, b) {
    const diffs = _.zipWith(a, b, (a,b) => a-b);
    return Math.sqrt(_.sumBy(diffs, x => x*x));
}

export function rgbL2(colora, colorb) {
    return l2(colora, colorb);
}

export function dECie76(colora, colorb) {
    return l2(convert.rgb.lab(colora), convert.rgb.lab(colorb));
}