// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
import {
	Amplify,
	CookieStorage,
	LibraryOptions,
	ResourcesConfig,
	defaultStorage,
	consoleProvider,
} from '@aws-amplify/core';
import {
	LegacyConfig,
	parseAWSExports,
} from '@aws-amplify/core/internals/utils';
import {
	cognitoUserPoolsTokenProvider,
	cognitoCredentialsProvider,
} from './auth/cognito';

export const DefaultAmplify = {
	/**
	 * Configures Amplify with the {@link resourceConfig} and {@link libraryOptions}.
	 *
	 * @param resourceConfig The {@link ResourcesConfig} object that is typically imported from the
	 * `amplifyconfiguration.json` file. It can also be an object literal created inline when calling `Amplify.configure`.
	 * @param libraryOptions The {@link LibraryOptions} additional options for the library.
	 *
	 * @example
	 * import config from './amplifyconfiguration.json';
	 *
	 * Amplify.configure(config);
	 */
	configure(
		resourceConfig: ResourcesConfig | LegacyConfig,
		libraryOptions?: LibraryOptions
	): void {
		let resolvedResourceConfig: ResourcesConfig;
		let resolvedLibraryOptions = libraryOptions;

		// add console logger provider by default
		if (!Amplify.libraryOptions?.Logging) {
			resolvedLibraryOptions = {
				...libraryOptions,
				Logging: {
					...libraryOptions?.Logging,
					console: libraryOptions?.Logging?.console ?? consoleProvider,
				},
			};
		}

		if (Object.keys(resourceConfig).some(key => key.startsWith('aws_'))) {
			resolvedResourceConfig = parseAWSExports(resourceConfig);
		} else {
			resolvedResourceConfig = resourceConfig as ResourcesConfig;
		}

		// If no Auth config is provided, no special handling will be required, configure as is.
		// Otherwise, we can assume an Auth config is provided from here on.
		if (!resolvedResourceConfig.Auth) {
			return Amplify.configure(resolvedResourceConfig, resolvedLibraryOptions);
		}

		// If Auth options are provided, always just configure as is.
		// Otherwise, we can assume no Auth libraryOptions were provided from here on.
		if (resolvedLibraryOptions?.Auth) {
			return Amplify.configure(resolvedResourceConfig, resolvedLibraryOptions);
		}

		// If no Auth libraryOptions were previously configured, then always add default providers.
		if (!Amplify.libraryOptions.Auth) {
			cognitoUserPoolsTokenProvider.setAuthConfig(resolvedResourceConfig.Auth);
			cognitoUserPoolsTokenProvider.setKeyValueStorage(
				// TODO: allow configure with a public interface
				resolvedLibraryOptions?.ssr
					? new CookieStorage({ sameSite: 'lax' })
					: defaultStorage
			);
			return Amplify.configure(resolvedResourceConfig, {
				...resolvedLibraryOptions,
				Auth: {
					tokenProvider: cognitoUserPoolsTokenProvider,
					credentialsProvider: cognitoCredentialsProvider,
				},
			});
		}

		// At this point, Auth libraryOptions would have been previously configured and no overriding
		// Auth options were given, so we should preserve the currently configured Auth libraryOptions.
		if (resolvedLibraryOptions) {
			// If ssr is provided through libraryOptions, we should respect the intentional reconfiguration.
			if (resolvedLibraryOptions.ssr !== undefined) {
				cognitoUserPoolsTokenProvider.setKeyValueStorage(
					// TODO: allow configure with a public interface
					resolvedLibraryOptions.ssr
						? new CookieStorage({ sameSite: 'lax' })
						: defaultStorage
				);
			}
			return Amplify.configure(resolvedResourceConfig, {
				Auth: Amplify.libraryOptions.Auth,
				...resolvedLibraryOptions,
				Logging: {
					...resolvedLibraryOptions?.Logging,
					// preserve console logger
					console:
						resolvedLibraryOptions?.Logging?.console ??
						Amplify.libraryOptions.Logging?.console,
				},
			});
		}

		// Finally, if there were no libraryOptions given at all, we should simply not touch the currently
		// configured libraryOptions.
		Amplify.configure(resolvedResourceConfig);
	},
	/**
	 * Returns the {@link ResourcesConfig} object passed in as the `resourceConfig` parameter when calling
	 * `Amplify.configure`.
	 *
	 * @returns An {@link ResourcesConfig} object.
	 */
	getConfig(): ResourcesConfig {
		return Amplify.getConfig();
	},
};
