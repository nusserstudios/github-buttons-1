(function() {
  'use strict';

  // Read a page's GET URL variables and return them as an associative array.
  // Source: https://jquery-howto.blogspot.com/2009/09/get-url-parameters-values-with-jquery.html
  function getUrlParameters() {
    var vars = [];
    var hash;
    var location = window.location;
    var hashes = location.href.slice(location.href.indexOf('?') + 1).split('&');

    for (var i = 0; i < hashes.length; i++) {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }

    return vars;
  }

  // Add commas to numbers
  function addCommas(n) {
    return String(n).replace(/(\d)(?=(\d{3})+$)/g, '$1,');
  }

  function jsonp(path) {
    var head = document.head;
    var script = document.createElement('script');

    script.src = path + '?callback=callback';
    head.insertBefore(script, head.firstChild);
  }

  var parameters = getUrlParameters();

  // Parameters
  var userParam = parameters.user;
  var repoParam = parameters.repo;
  var typeParam = parameters.type;
  var countParam = parameters.count;
  var sizeParam = parameters.size;
  var versionParam = parameters.v;

  // Elements
  var buttonElement = document.querySelector('.gh-btn');
  var mainButtonElement = document.querySelector('.github-btn');
  var textElement = document.querySelector('.gh-text');
  var counterElement = document.querySelector('.gh-count');

  // Constants
  var LABEL_SUFFIX = 'on GitHub';
  var GITHUB_URL = 'https://github.com/';
  var API_URL = 'https://api.github.com/';
  var REPO_URL = GITHUB_URL + userParam + '/' + repoParam;
  var USER_REPO = userParam + '/' + repoParam;

  function setupCounter(data, message) {
    counterElement.textContent = data && addCommas(data);
    counterElement.setAttribute('aria-label', counterElement.textContent + ' ' + message + ' ' + LABEL_SUFFIX);
  }

  window.callback = function(obj) {
    if (obj.data.message === 'Not Found') {
      return;
    }

    switch (typeParam) {
      case 'watch':
        if (versionParam === '2') {
          setupCounter(obj.data.subscribers_count, 'watchers');
        } else {
          setupCounter(obj.data.stargazers_count, 'stargazers');
        }

        break;
      case 'star':
        setupCounter(obj.data.stargazers_count, 'stargazers');
        break;
      case 'fork':
        setupCounter(obj.data.network_count, 'forks');
        break;
      case 'follow':
        setupCounter(obj.data.followers, 'followers');
        break;
    }

    // Show the count if asked and if it's not empty
    if (countParam === 'true' && counterElement.textContent !== '') {
      counterElement.style.display = 'block';
      counterElement.removeAttribute('aria-hidden');
    }
  };

  // Set href to be URL for repo
  buttonElement.href = REPO_URL;

  var title;

  // Add the class, change the text label, set count link href
  switch (typeParam) {
    case 'watch':
      if (versionParam === '2') {
        mainButtonElement.className += ' github-watchers';
        textElement.textContent = 'Watch';
        counterElement.href = REPO_URL + '/watchers';
      } else {
        mainButtonElement.className += ' github-stargazers';
        textElement.textContent = 'Star';
        counterElement.href = REPO_URL + '/stargazers';
      }

      title = textElement.textContent + ' ' + USER_REPO;
      break;
    case 'star':
      mainButtonElement.className += ' github-stargazers';
      textElement.textContent = 'Star';
      counterElement.href = REPO_URL + '/stargazers';
      title = textElement.textContent + ' ' + USER_REPO;
      break;
    case 'fork':
      mainButtonElement.className += ' github-forks';
      textElement.textContent = 'Fork';
      buttonElement.href = REPO_URL + '/fork';
      counterElement.href = REPO_URL + '/network';
      title = textElement.textContent + ' ' + USER_REPO;
      break;
    case 'follow':
      mainButtonElement.className += ' github-me';
      textElement.textContent = 'Follow @' + userParam;
      buttonElement.href = GITHUB_URL + userParam;
      counterElement.href = GITHUB_URL + userParam + '?tab=followers';
      title = textElement.textContent;
      break;
    case 'sponsor':
      mainButtonElement.className += ' github-me';
      textElement.textContent = 'Sponsor @' + userParam;
      buttonElement.href = GITHUB_URL + 'sponsors/' + userParam;
      title = textElement.textContent;
      break;
  }

  buttonElement.setAttribute('aria-label', title + ' ' + LABEL_SUFFIX);
  document.title = title + ' ' + LABEL_SUFFIX;

  // Change the size if requested
  if (sizeParam === 'large') {
    mainButtonElement.className += ' github-btn-large';
  }

  // If count is not requested or type is sponsor,
  // there's no need to make an API call
  if (countParam !== 'true' || typeParam === 'sponsor') {
    return;
  }

  if (typeParam === 'follow') {
    jsonp(API_URL + 'users/' + userParam);
  } else {
    jsonp(API_URL + 'repos/' + userParam + '/' + repoParam);
  }
})();
