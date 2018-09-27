function saveAndDeployNewVersion() {
  var projectId = "1AUxZTkOqLpP33ywkgo8T2NJlkfZ3CznkkKvWiTAiHY6KIhq7hFqbjpsM"; // your script project's Drive ID.
  var description = "my new version"; // the description of the new version to create
  var newVersionNumber = saveNewProjectVersion_(projectId, description);
  var webAppUrl = deployNewProjectVersion_(projectId, newVersionNumber);
  Logger.log(webAppUrl);
}

/**
 * Save a new version of the script project.
 *
 * @param  {string} projectId - The script project's Drive ID.
 * @param  {string} description - The description for this version.
 *
 * @return {number} The version number for the newly created version.
 */
function saveNewProjectVersion_(projectId, description) {  
  var payload = JSON.stringify({description: description});
  return makeRequest_(projectId, 'versions', 'post', payload).versionNumber;
}

/**
 * Deploy for the first time the script as a web app or update the deployment with the new script version.
 * if already deployed, we should find a deployment named "web app meta-version"
 *
 * @param  {string} projectId - The script project's Drive ID.
 * @param  {number} newVersionNumber - The new version number of the project.
 *
 * @return {number} The url of the web app.
 */
function deployNewProjectVersion_(projectId, newVersionNumber) {
  var deploymentId = getWebAppDeploymentId_(projectId) || createDeploymentAsWebApp_(projectId, newVersionNumber);
  
  var payload = JSON.stringify({deploymentConfig:{versionNumber:newVersionNumber, description: "web app meta-version"}});
  var output = makeRequest_(projectId, 'deployments/' + deploymentId, 'put', payload);
  var entryPoints = output.entryPoints;
  for (var i in entryPoints) {
    if (entryPoints[i].webApp) return entryPoints[i].webApp.url;
  }
}

/**
 * Create first deployment as an Apps Script web app with the new version of the project.
 *
 * @param  {string} projectId - The script project's Drive ID.
 * @param  {number} newVersionNumber - The new version number of the project.
 *
 * @return {string} The deployment ID for the deployment as an Apps Script web app.
 */
function createDeploymentAsWebApp_(projectId, newVersionNumber) {
  var payload = JSON.stringify({versionNumber: newVersionNumber, description: "web app meta-version"});
  return makeRequest_(projectId, 'deployments', 'post', payload).deploymentId;
}

/**
 * Get the deployment ID for the deployment as an Apps Script web app.
 * If it exists, description should be "web app meta-version".
 *
 * @param  {string} projectId - The script project's Drive ID.
 *
 * @return {string} The deployment ID for the deployment as an Apps Script web app.
 */
function getWebAppDeploymentId_(projectId) {
  var output = makeRequest_(projectId, "deployments");
  if (output.nextPageToken) throw "Project contains more than 50 saved deployments, update code to retrieve all results";
  var deployments = output.deployments;
  for (var i in deployments) {
    if (deployments[i].deploymentConfig.description == "web app meta-version") return deployments[i].deploymentId;
  }
}

/**
 * Make calls to the Apps Script API
 * Required scopes:
 * - https://www.googleapis.com/auth/script.external_request
 * - https://www.googleapis.com/auth/script.deployments
 * - https://www.googleapis.com/auth/script.projects
 *
 * @param  {string} projectId - The script project's Drive ID.
 * @param  {string} resourcePath - The resource path.
 * @param  {string} [method] - the HTTP method for the request.
 * @param  {string} [payload] - the payload (e.g. POST body) for the request.
 *
 * @return {object} The response from the Apps Script API.
 */
function makeRequest_(projectId, resourcePath, method, payload) {
  var baseUrl = "https://script.googleapis.com/v1/projects/";
  var url = baseUrl + projectId + "/" + resourcePath;
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
