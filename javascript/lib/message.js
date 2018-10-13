const request = require('request');
const log = require('./logger');

const ptcl = 'http://';

module.exports.send = (url, type, data, next) => {
    data['type'] = type;
    let queryString = Object.keys(data).map(key => key + '=' + data[key]).join('&');
    log.info(ptcl + url + '/msg?' + queryString);
	request({method: 'GET', url: ptcl + url + '/msg?' + queryString}, next);
};

module.exports.live = (url, next) => {
    request({method: 'GET', url: ptcl + url + '/'}, next)
};