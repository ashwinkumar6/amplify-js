// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { BucketInfo, CredentialsProvider } from './options';

// TODO(aswhinkumar6): finalize on API signature
// Question(aswhinkumar6): should we inherit from standard API interface ?
export interface GetPropertiesInput {
	// Question(ashwinkumar6): why not keep bucket and region flat ?
	bucket: BucketInfo;
	/**
	 * S3 object key.
	 */
	path: string;
	/**
	 * Async function resolved to AWS credentials to
	 * authorize AWS requests.
	 */
	credentialsProvider: CredentialsProvider;

	options?: {
		/**
		 * Whether to use accelerate endpoint.
		 * @default false
		 */
		useAccelerateEndpoint?: boolean;
		/**
		 * [OUT OF SCOPE FOR THIS REVIEW]Additional string to be appended to the user
		 * agent header.
		 *
		 * @internal
		 */
		customUserAgent?: string;
		/**
		 * [OUT OF SCOPE FOR THIS REVIEW]Custom S3 base host name. The bucket name may be
		 * added to subdomain.
		 *
		 */
		customEndpoint?: string;
		/**
		 * [OUT OF SCOPE FOR THIS REVIEW]After the request has been construct but before
		 * it's authorized, apply changes to the request
		 * headers.
		 */
		customHeaders?(input: {
			/**
			 * Existing headers value of given request.
			 */
			existingHeaders: Record<Lowercase<string>, string>;
			/**
			 * S3 operation name. e.g. 'headObject'
			 */
			apiName: string;
		}): Promise<Record<Lowercase<string>, string>>;
	};
}
