const http = require('http');
const express = require('express');
const axios = require('axios');
const { UnauthorizedError } = require('client-errors');
const assert = require('assert');

const apiHandler = require('./index');
const baseUrl = 'http://localhost:8080';

const handleResponse = apiHandler.handleResponse;

const app = express();
app.set('port', 8080);
const server = http.createServer(app);
server.listen(8080);

const axiosResult = (axiosRequest, { status, value } = {}, done) => {
  return axiosRequest.then(res => {
      return {
        status: res.status,
        value: res.data
      }
    })
    .catch(err => {
      return {
        status: err.response.status,
        value: err.response.data.message
      }
    })
    .then(({ status, value }) => {
      assert.equal(status, status);
      assert.equal(value, value);
    })
    .then(done)
    .catch(done);
};

describe('Single Middleware', function() {
  const key = 'single-middleware';
  const status = 200;
  const value = 'apple';

  it(`should return ${value}`, function(done) {
    app.get(`/${key}`, handleResponse(fnApple));
    axiosResult(axios.get(`${baseUrl}/${key}`), { status, value }, done);
  });
});

describe('Multiple Middlewares', function() {
  const key = 'multiple-middlewares';
  const status = 200;
  const value = 'pear';

  it(`should return ${value}`, function(done) {
    app.get(`/${key}`, handleResponse(fnAppleNext, fnPear));
    axiosResult(axios.get(`${baseUrl}/${key}`), { status, value }, done);
  });
});

describe('Multiple Middlewares Array', function() {
  const key = 'multiple-middlewares-array';
  const status = 200;
  const value = 'pear';

  it(`should return ${value}`, function(done) {
    app.get(`/${key}`, handleResponse([fnAppleNext, fnPear]));
    axiosResult(axios.get(`${baseUrl}/${key}`), { status, value }, done);
  });
});

describe('Multiple Async Middlewares', function() {
  const key = 'multiple-async-middlewares';
  const status = 200;
  const value = 'pear';

  it(`should return ${value}`, function(done) {
    app.get(`/${key}`, handleResponse(fnAppleNext, fnPearPromise));
    axiosResult(axios.get(`${baseUrl}/${key}`), { status, value }, done);
  });
});

describe('Error Handling', function() {
  const key = 'error-handling';
  const status = 422;
  const value = 'error1';

  it(`should return ${value}`, function(done) {
    app.get(`/${key}`, handleResponse(fnAppleNext, fnError1, fnPear));
    axiosResult(axios.get(`${baseUrl}/${key}`), { status, value }, done);
  });
});

describe('Async Error Handling', function() {
  const key = 'async-error-handling';
  const status = 422;
  const value = 'error1';

  it(`should return ${value}`, function(done) {
    app.get(`/${key}`, handleResponse(fnAppleNext, fnError1Promise, fnPear));
    axiosResult(axios.get(`${baseUrl}/${key}`), { status, value }, done);
  });
});

describe('Multiple Async Error Handling', function() {
  const key = 'multiple-async-error-handling';
  const status = 422;
  const value = 'error1';

  it(`should return ${value}`, function(done) {
    app.get(`/${key}`, handleResponse(fnError2Next, fnError1));
    axiosResult(axios.get(`${baseUrl}/${key}`), { status, value }, done);
  });
});

describe('Custom Client Error Handling', function() {
  const key = 'custom-client-error-handling';
  const status = 401;
  const value = 'The user is not authorized';

  it(`should return ${value}`, function(done) {
    app.get(`/${key}`, handleResponse(fnClientError));
    axiosResult(axios.get(`${baseUrl}/${key}`), { status, value }, done);
  });
});

describe('Custom Error Message Provider', function() {
  const key = 'custom-error-message-provider';
  const status = 422;
  const value = 'customError';

  it(`should return ${value}`, function(done) {

    apiHandler.errorMessageProvider = function(err) {
      return 'customError';
    }

    app.get(`/${key}`, handleResponse(fnError1));
    axiosResult(axios.get(`${baseUrl}/${key}`), { status, value }, done);
  });
});

function fnApple(req, res, next) {
  return 'apple';
}

function fnApplePromise(req, res, next) {
  return Promise.resolve('apple');
}

function fnAppleNext(req, res, next) {
  next();
  return 'apple'
}

function fnPear(req, res, next) {
  return 'pear';
}

function fnPearPromise(req, res, next) {
  return Promise.resolve('pear');
}

function fnPearNext(req, res, next) {
  next();
  return Promise.resolve('pear');
}

function fnError1(req, res, next) {
  throw new Error('error1');
}

function fnError1Promise(req, res, next) {
  return Promise.reject(new Error('error1'));
}

function fnError2Next(req, res, next) {
  next();
  throw new Error('error2');
}

function fnClientError(req, res, next) {
  throw new UnauthorizedError();
}
