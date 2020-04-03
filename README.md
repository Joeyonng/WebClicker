# WebClicker

# For Developers:
- Create a Firebase Project and get your own firebaseConfig. You should copy the firebaseConfig from your firebase project settings.
    > 1. Sign in to Firebase, then open your project.
    > 2. Click the Settings icon, then select Project settings.
    > 3. In the Your apps card, select the nickname of the app for which you need a config object.
    > 4. Select Config from the Firebase SDK snippet pane.
    > 5. Get the config object snippet.
    > 6. Create a file in `./frontend/src/` named `credentials.js`
    > 7. Copy the config object to that file and add this line of code after the object snippet: `export firebaseConfig`
- Install the dependencies: `npm install`
- Start the development server `npm start`
