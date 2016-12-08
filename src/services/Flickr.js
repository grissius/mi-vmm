import fetch from 'isomorphic-fetch';
import _ from 'lodash';
import querystring from 'querystring';

const base = {
    uri: 'https://api.flickr.com/services/rest/',
    qs: {
        nojsoncallback: true,
        format: 'json',
        api_key: 'cd25489fc05fc901658637c2af9f5ed1',
    },
    headers: {
        Accept: 'application/json',
    }
}

export function searchPhotos(query, limit) {
    return callApi(null, {
        qs: {
            text: query,
            method: 'flickr.photos.search',
            sort: 'relevance'
        }
    })
        .then(response => response.photos.photo.slice(0, limit));
}


export function callApi(uri, _params) {
    const params = _.merge({}, _params, base);
    const fetchUri = `${base.uri}${uri || ''}?${querystring.stringify(params.qs)}`;
    console.debug(`Calling ${fetchUri}`);
    return fetch(fetchUri, params)
        .then(res => res.json())
        .catch(err => {
            console.error(`${fetchUri} failed: ${err.message}`);
            throw err;
        })
}