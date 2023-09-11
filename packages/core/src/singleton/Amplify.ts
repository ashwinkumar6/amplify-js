// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import { AuthClass } from './Auth';
import { Hub, AMPLIFY_SYMBOL } from '../Hub';
import { LibraryOptions, ResourcesConfig } from './types';

// TODO(v6): add default AuthTokenStore for each platform

export class AmplifyClass {
	resourcesConfig: ResourcesConfig;
	libraryOptions: LibraryOptions;
	/**
	 * Cross-category Auth utilities.
	 *
	 * @internal
	 */
	public readonly Auth: AuthClass;
	constructor() {
		this.resourcesConfig = {};
		this.Auth = new AuthClass();

		// TODO(v6): add default providers for getting started
		this.libraryOptions = {};
	}

	/**
	 * Configures Amplify for use with your back-end resources.
	 *
	 * @remarks
	 * `configure` can be used to specify additional library options where available for supported categories.
	 *
	 * @param resourceConfig - Back-end resource configuration. Typically provided via the `aws-exports.js` file.
	 * @param libraryOptions - Additional options for customizing the behavior of the library.
	 */
	configure(
		resourcesConfig: ResourcesConfig,
		libraryOptions: LibraryOptions = {}
	): void {
		this.resourcesConfig = mergeResourceConfig(
			this.resourcesConfig,
			resourcesConfig
		);

		this.libraryOptions = mergeLibraryOptions(
			this.libraryOptions,
			libraryOptions
		);

		this.Auth.configure(this.resourcesConfig.Auth!, this.libraryOptions.Auth);

		Hub.dispatch(
			'core',
			{
				event: 'configure',
				data: resourcesConfig,
			},
			'Configure',
			AMPLIFY_SYMBOL
		);
	}

	/**
	 * Provides access to the current back-end resource configuration for the Library.
	 *
	 * @returns Returns the current back-end resource configuration.
	 */
	getConfig(): ResourcesConfig {
		return JSON.parse(JSON.stringify(this.resourcesConfig));
	}
}

/**
 * The `Amplify` utility is used to configure the library.
 *
 * @remarks
 * `Amplify` is responsible for orchestrating cross-category communication within the library.
 */
export const Amplify = new AmplifyClass();

// TODO(v6): validate until which level this will nested, during Amplify.configure API review.
function mergeResourceConfig(
	existingConfig: ResourcesConfig,
	newConfig: ResourcesConfig
): ResourcesConfig {
	const resultConfig: Record<string, any> = {};

	for (const category of Object.keys(existingConfig)) {
		resultConfig[category] = existingConfig[category as keyof ResourcesConfig];
	}

	for (const key of Object.keys(newConfig).filter(key => key !== 'ssr')) {
		resultConfig[key] = {
			...resultConfig[key],
			...newConfig[key as Exclude<keyof ResourcesConfig, 'ssr'>],
		};
	}

	resultConfig.ssr = newConfig.ssr;

	return resultConfig;
}

function mergeLibraryOptions(
	existingConfig: LibraryOptions,
	newConfig: LibraryOptions
): LibraryOptions {
	const resultConfig: Record<string, any> = {};

	for (const category of Object.keys(existingConfig)) {
		resultConfig[category] = existingConfig[category as keyof LibraryOptions];
	}

	for (const category of Object.keys(newConfig)) {
		resultConfig[category] = {
			...resultConfig[category],
			...newConfig[category as keyof LibraryOptions],
		};
	}

	return resultConfig;
}