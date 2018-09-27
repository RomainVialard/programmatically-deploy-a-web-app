## Programmatically deploy an Apps Script web app

In 2012, the Google Apps Script team released the [Script service](https://developers.google.com/apps-script/reference/script/), which provided the ability to publish scripts as web app programmatically, using ScriptApp.getService().enable(). But soon after this become broken then deprecated due to different updates.

You can follow the issue / feature request here: [https://issuetracker.google.com/issues/36756212](https://issuetracker.google.com/issues/36756212)

Thanks to updates of the [Apps Script API](https://developers.google.com/apps-script/api/) it is now possible again to programmatically deploy a web app. Note that if you are developing Apps Script projects locally, it is recommended to use [clasp](https://github.com/google/clasp), which provides all required methods.

The present code sample is useful for developers who want to manage this deployment via Apps Script itself.

To be able to programmatically deploy a script as a web app, several steps are required:



1.  The project **manifest** (**appscript.json**) needs to be updated with the correct web app configuration (not required if script is already deployed as a web app and you simply want to publish a new version)
1.  A new version of the project needs to be created (or at least one version must have been created and selected as the version to publish)
1.  Then we can deploy as a web app this new version (through the 'deployments' endpoint)

Note that you should not [create](https://developers.google.com/apps-script/api/reference/rest/v1/projects.deployments/create) a new deployment but instead [update](https://developers.google.com/apps-script/api/reference/rest/v1/projects.deployments/update) an existing one. Creating a new deployment would generate a new web app, **with a new url** while update the existing one will preserve the web app url (exactly like when you use the "Deploy as web app" menu entry).

Specifically, when you deploy your script as a web app, it will generate a deployment named "**web app meta-version**" and this is the deployment that you should update.


![alt_text](https://storage.googleapis.com/yamm-ressources/Images/deployment.png "image_tooltip")


Note that everything is working perfectly if you first do it manually (using the "Deploy as web app" menu entry) and then push updates programmatically. But if you want to do everything programmatically, including the first deployment, you will not be able to ever use the "Deploy as web app" menu entry (well, you can, but this will generate a new deployment, with a new web app url, because the Apps Script editor will not recognize that the script is already deployed as a web app).
