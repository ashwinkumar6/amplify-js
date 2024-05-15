import { CognitoJwtVerifier } from 'aws-jwt-verify';

interface isValidCognitoTokenInput {
	token: string;
	userPoolId: string;
	clientId: string;
	tokenType: 'id' | 'access';
}

/**
 * Verifies a Cognito JWT token for its validity.
 *
 * @param input - An object containing:
 *                - token: The JWT token as a string that needs to be verified.
 *                - userPoolId: The ID of the AWS Cognito User Pool to which the token belongs.
 *                - clientId: The Client ID associated with the Cognito User Pool.
 * @returns A promise that resolves to a boolean indicating whether the token is valid or not.
 * @internal
 */
export const isValidCognitoToken = async (
	input: isValidCognitoTokenInput,
): Promise<boolean> => {
	const { userPoolId, clientId, tokenType, token } = input;

	try {
		const verifier = CognitoJwtVerifier.create({
			userPoolId,
			tokenUse: tokenType,
			clientId,
		});
		await verifier.verify(token);

		return true;
	} catch (error) {
		return false;
	}
};
