import fetch from 'isomorphic-fetch';
import _ from 'lodash';
import querystring from 'querystring';

const base = {
    uri: 'http://localhost:4000/steal-color',
    headers: {
        Accept: 'application/json',
    }
};

export function stealColors(images) {
    return callApi(null, {
        qs: {
            images: _.map(images, image => image.url)
        }
    });
}


export function callApi(uri, _params) {
    const params = _.merge({}, _params, base);
    const fetchUri = `${base.uri}${uri || ''}?${querystring.stringify(params.qs)}`;
    console.debug(`Calling ${fetchUri}`);
    return fetch(fetchUri, params)
        .then(res => res.json())
        .catch(err => {
            console.error(`${fetchUri} failed: ${err.message}`);
            throw new Error('Failed to fetch colors from server.');
        })
}