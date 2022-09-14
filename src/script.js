var htmlCssJsTemplate = (function() {

  const APP_DATA_KEY = "app-name";

  const outputDiv = document.getElementById("output");
  const runBtn = document.getElementById("runBtn");

  let count = 0;
  let data = {};

  window.onload = function() {
    loadData();
    displayData();

    runBtn.onclick = function() {
      console.log('ran');
      count++;
      displayData();
    };
  }
  function displayData() {
    outputDiv.innerHTML = "Ran " + count + " times.";
  }
  function loadData() {
    const localData = window.localStorage.getItem(APP_DATA_KEY);
    if (localData) {
      const parsedData = JSON.parse(localData);
      if (parsedData) {
        data = parsedData;
      }
    }
  }
  function saveData() {
    window.localStorage.setItem(APP_DATA_KEY, JSON.stringify(data));
  }
  function clearData() {
    window.localStorage.setItem(APP_DATA_KEY, JSON.stringify(data));
  }
  /**
   * Converts HTML entities to code format.
   */
  function encodedStr(str) {
    return str.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
      return '&#' + i.charCodeAt(0) + ';';
    });
  }

})();