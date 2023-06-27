const { defineConfig } = require('cypress');

module.exports = defineConfig({
	env: {
		COGNITO_SIGN_IN_USERNAME: 'test01',
		COGNITO_SIGN_IN_PASSWORD: 'The#test1',
		COGNITO_SIGN_IN_EMAIL: 'samlmar+test01@amazon.com',
		COGNITO_SIGN_IN_PHONE_NUMBER: '5555555555',
		TOTP_SIGN_IN_USERNAME: 'totp_test_2',
		TOTP_SIGN_IN_PASSWORD: 'Good#password1',
		UNVERIFIED_CONTACT_USERNAME: 'testUnverifiedContact',
		STORAGE_COPY_SIGN_IN_USERNAME: 'jamesauchu',
		STORAGE_COPY_SIGN_IN_PASSWORD: 'goodpassword#123',
		STORAGE_COPY_FROM_IDENTITY_ID:
			'us-west-2:b9b97f26-949c-4a4c-b94c-52c1b2049055',
		AUTO_SIGN_IN_USERNAME: 'autosignintestuser',
		AUTO_SIGN_IN_PASSWORD: 'autoS1gnInP@ss',
		AUTO_SIGN_IN_EMAIL: 'autosignintestemail@amazon.com',
		'cypress-plugin-snapshots': {
			imageConfig: {
				threshold: 0.1,
			},
		},
	},
	chromeWebSecurity: true,
	includeShadowDom: true,
	defaultCommandTimeout: 15000,
	experimentalWebKitSupport: true,
	e2e: {
		// We've imported your old cypress plugins here.
		// You may want to clean this up later by importing these.
		setupNodeEvents(on, config) {
			return require('./cypress/plugins/index.js')(on, config);
		},
		baseUrl: 'http://localhost:3000/',
		"retries": {
    			"runMode": 3,
    			"openMode": 0
  		},
		specPattern: 'cypress/integration/**/*.spec.{ts,js}',
		excludeSpecPattern: ['**/__snapshots__/*', '**/__image_snapshots__/*'],
	},
});
