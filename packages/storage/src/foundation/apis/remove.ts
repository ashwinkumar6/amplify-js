// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// TODO(ashwinkumar6): import from foundational API
import { GetPropertiesInput } from './types';
import { remove as removeFoundation } from '../../../providers/s3/apis/internal/remove';

// ADV API
export const remove = async (input: GetPropertiesInput): Promise<void> => {
	const { bucket, credentialsProvider, path, options } = input;
	const { useAccelerateEndpoint, customEndpoint, customUserAgent } =
		options ?? {};

	// TODO(ashwinkumar6): move service call to foundation
	// TODO(ashwinkumar6): 'customHeaders' input isn't wired up
	await removeFoundation(
		{
			credentials: (await credentialsProvider()).credentials,
			region: bucket.region,
			userAgentValue: customUserAgent,
			useAccelerateEndpoint,
			customEndpoint,
		},
		{
			Bucket: bucket.bucketName,
			Key: path,
		},
	);
};
