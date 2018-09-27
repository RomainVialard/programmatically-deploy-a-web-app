function saveAndDeployNewVersion() {  
  var projectId = "1AUxZTkOqLpP33ywkgo8T2NJlkfZ3CznkkKvWiTAiHY6KIhq7hFqbjpsM";
  var description = "my new version";
  var newVersionNumber = saveNewProjectVersion_(projectId, description);
  var webAppUrl = deployNewProjectVersion_(projectId, newVersionNumber);
  Logger.log(webAppUrl);
}

function saveNewProjectVersion_(projectId, description) {  
  var payload = JSON.stringify({description: description});
  return makeRequest_(projectId, 'versions', 'post', payload).versionNumber;
}

function deployNewProjectVersion_(projectId, newVersionNumber) {
  // Creating a new deployment will generate a new web app url
  // best is to update an existing deployment
  // here we update a deployment named "Prod", or create it if it does not exist
  var deploymentId = getDeploymentId_(projectId) || createNewDeployment_(projectId, newVersionNumber);
  
  var payload = JSON.stringify({deploymentConfig:{versionNumber:newVersionNumber, description: "web app meta-version"}});
  var output = makeRequest_(projectId, 'deployments/' + deploymentId, 'put', payload);
  var entryPoints = output.entryPoints;
  for (var i in entryPoints) {
    if (entryPoints[i].webApp) return entryPoints[i].webApp.url;
  }
}

function createNewDeployment_(projectId, newVersionNumber) {
  var payload = JSON.stringify({versionNumber: newVersionNumber, description: "web app meta-version"});
  return makeRequest_(projectId, 'deployments', 'post', payload).deploymentId
}

function getDeploymentId_(projectId) {
  var output = makeRequest_(projectId, "deployments");
  if (output.nextPageToken) throw "Project contains more than 50 saved deployments, update code to retrieve all results";
  var deployments = output.deployments;
  for (var i in deployments) {
    if (deployments[i].deploymentConfig.description == "web app meta-version") return deployments[i].deploymentId;
  }
}

function makeRequest_(projectId, resource, method, payload) {
  var baseUrl = "https://script.googleapis.com/v1/projects/";
  var url = baseUrl + projectId + "/" + resource;
  var options = {
    headers: {
      Authorization: "Bearer " + ScriptApp.getOAuthToken()
    }
  };
  if (method == 'post' || method == 'put') {
    options.method = method;
    options.payload = payload;
    options.headers['Content-Type'] = 'application/json';
  }
  return JSON.parse(UrlFetchApp.fetch(url, options));
}
