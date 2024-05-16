// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { ResourcesConfig, sharedInMemoryStorage } from '@aws-amplify/core';
import {
	createAWSCredentialsAndIdentityIdProvider,
	createKeyValueStorageFromCookieStorageAdapter,
	createUserPoolsTokenProvider,
	runWithAmplifyServerContext as runWithAmplifyServerContextCore,
} from 'aws-amplify/adapter-core';
import { isValidCognitoToken } from '@aws-amplify/core/internals/utils';
import { CookieStorage } from '@aws-amplify/core/internals/adapter-core';

import { NextServer } from '../types';

import { createCookieStorageAdapterFromNextServerContext } from './createCookieStorageAdapterFromNextServerContext';

export const createRunWithAmplifyServerContext = ({
	config: resourcesConfig,
}: {
	config: ResourcesConfig;
}) => {
	const runWithAmplifyServerContext: NextServer.RunOperationWithContext =
		async ({ nextServerContext, operation }) => {
			// When the Auth config is presented, attempt to create a Amplify server
			// context with token and credentials provider.
			if (resourcesConfig.Auth) {
				// When `null` is passed as the value of `nextServerContext`, opt-in
				// unauthenticated role (primarily for static rendering). It's
				// safe to use the singleton `MemoryKeyValueStorage` here, as the
				// static rendering uses the same unauthenticated role cross-sever.
				let keyValueStorage;
				if (nextServerContext === null) {
					keyValueStorage = sharedInMemoryStorage;
				} else {
					const cookieStorageAdapter =
						createCookieStorageAdapterFromNextServerContext(nextServerContext);
					await validateTokens(resourcesConfig, cookieStorageAdapter);
					keyValueStorage =
						createKeyValueStorageFromCookieStorageAdapter(cookieStorageAdapter);
				}

				const credentialsProvider = createAWSCredentialsAndIdentityIdProvider(
					resourcesConfig.Auth,
					keyValueStorage,
				);
				const tokenProvider = createUserPoolsTokenProvider(
					resourcesConfig.Auth,
					keyValueStorage,
				);

				return runWithAmplifyServerContextCore(
					resourcesConfig,
					{
						Auth: { credentialsProvider, tokenProvider },
					},
					operation,
				);
			}

			// Otherwise it may be the case that auth is not used, e.g. API key.
			// Omitting the `Auth` in the second parameter.
			return runWithAmplifyServerContextCore(resourcesConfig, {}, operation);
		};

	return runWithAmplifyServerContext;
};

const validateTokens = async (
	resourcesConfig: ResourcesConfig,
	cookieStorage: CookieStorage.Adapter,
) => {
	// extract accessToken, idToken
	const { accessToken, idToken } = cookieStorage.getAll().reduce(
		(output, obj) => {
			if (obj.name.includes('.accessToken')) {
				output.accessToken = obj.value;
			} else if (obj.name.includes('.idToken')) {
				output.idToken = obj.value;
			}

			return output;
		},
		{ accessToken: '', idToken: '' } as {
			accessToken: string | undefined;
			idToken: string | undefined;
		},
	);

	// extract userPoolId, clientId
	const {
		Auth: {
			Cognito: {
				userPoolId = undefined,
				userPoolClientId: clientId = undefined,
			} = {},
		} = {},
	} = resourcesConfig || {};

	let isValid = false;
	if (userPoolId && clientId && accessToken) {
		isValid = await isAccessTokenAndIdTokenValid({
			userPoolId,
			clientId,
			accessToken,
			idToken,
		});

		// TODO: confirm error message
		if (!isValid) throw new Error('InvalidTokenException: Token is invalid');
	}
};

const isAccessTokenAndIdTokenValid = async ({
	userPoolId,
	clientId,
	accessToken,
	idToken,
}: {
	userPoolId: string;
	clientId: string;
	accessToken: string;
	idToken: string | undefined;
}): Promise<boolean> => {
	const isAccessTokenValid = await isValidCognitoToken({
		clientId,
		userPoolId,
		tokenType: 'access',
		token: accessToken,
	});

	// TODO: is this correct ?
	const isIdTokenValid = idToken
		? await isValidCognitoToken({
				clientId,
				userPoolId,
				tokenType: 'access',
				token: accessToken,
			})
		: true;

	return !isAccessTokenValid || !isIdTokenValid;
};
