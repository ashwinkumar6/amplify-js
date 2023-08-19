// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AmplifyV6, assertTokenProviderConfig } from '@aws-amplify/core';
import {
	AuthSignUpResult,
	AuthSignUpStep,
	AuthStandardAttributeKey,
	ConfirmSignUpRequest,
} from '../../../types';
import { CustomAttribute, CognitoConfirmSignUpOptions } from '../types';
import { assertValidationError } from '../../../errors/utils/assertValidationError';
import { AuthValidationErrorCode } from '../../../errors/types/validation';
import { ConfirmSignUpException } from '../types/errors';
import { confirmSignUp as confirmSignUpClient } from '../utils/clients/CognitoIdentityProvider';
import { getRegion } from '../utils/clients/CognitoIdentityProvider/utils';

/**
 * Confirms a new user account.
 *
 * @param confirmSignUpRequest - The ConfirmSignUpRequest object.
 * @throws -{@link ConfirmSignUpException }
 * Thrown due to an invalid confirmation code.
 * @throws -{@link AuthValidationErrorCode }
 * Thrown due to an empty confirmation code
 *
 * @throws AuthTokenConfigException - Thrown when the token provider config is invalid.
 *
 * @returns AuthSignUpResult
 */
export async function confirmSignUp(
	confirmSignUpRequest: ConfirmSignUpRequest<CognitoConfirmSignUpOptions>
): Promise<AuthSignUpResult<AuthStandardAttributeKey | CustomAttribute>> {
	const { username, confirmationCode, options } = confirmSignUpRequest;

	const authConfig = AmplifyV6.getConfig().Auth;
	assertTokenProviderConfig(authConfig);
	const clientMetadata =
		options?.serviceOptions?.clientMetadata ?? authConfig.clientMetadata;
	assertValidationError(
		!!username,
		AuthValidationErrorCode.EmptyConfirmSignUpUsername
	);
	assertValidationError(
		!!confirmationCode,
		AuthValidationErrorCode.EmptyConfirmSignUpCode
	);

	await confirmSignUpClient(
		{ region: getRegion(authConfig.userPoolId) },
		{
			Username: username,
			ConfirmationCode: confirmationCode,
			ClientMetadata: clientMetadata,
			ForceAliasCreation: options?.serviceOptions?.forceAliasCreation,
			ClientId: authConfig.userPoolWebClientId,
			// TODO: handle UserContextData
		}
	);

	return {
		isSignUpComplete: true,
		nextStep: {
			signUpStep: AuthSignUpStep.DONE,
		},
	};
}