// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Credentials } from '@aws-sdk/types';
import { fetchAuthSession } from '@aws-amplify/core';
import { AmplifyV6 } from '@aws-amplify/core';
import { listObjectsV2 } from '../../../src/AwsClients/S3';
import { list } from '../../../src/providers/s3';

jest.mock('../../../src/AwsClients/S3');
jest.mock('@aws-amplify/core', () => {
	const core = jest.requireActual('@aws-amplify/core');
	return {
		...core,
		fetchAuthSession: jest.fn(),
		AmplifyV6: {
			...core.AmplifyV6,
			getConfig: jest.fn(),
		},
	};
});

const credentials: Credentials = {
	accessKeyId: 'accessKeyId',
	sessionToken: 'sessionToken',
	secretAccessKey: 'secretAccessKey',
};
const targetIdentityId = 'targetIdentityId';
const accessLevel = 'protected';
const bucket = 'bucket';
const region = 'region';
const path = 'path';
const pageSize = 50;
const nextToken = 'nextToken';
const listAll = true;

const clientConfig = {
	region,
	credentials,
};
const clientParams = {
	Bucket: bucket,
	Prefix: `${accessLevel}/${targetIdentityId}/${path}`,
	MaxKeys: pageSize,
	ContinuationToken: nextToken,
};

// TODO: test validation errors
describe('Storage list API', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	(fetchAuthSession as jest.Mock).mockResolvedValue({
		credentials,
		identityId: targetIdentityId,
	});
	(AmplifyV6.getConfig as jest.Mock).mockReturnValue({
		Storage: {
			bucket,
			region,
		},
	});

	it('should supply the correct parameters to listObjectsV2 API handler', async () => {
		expect.assertions(2);
		(listObjectsV2 as jest.Mock).mockResolvedValueOnce({
			Contents: [
				{
					Key: 'Key',
					LastModified: 'lastModified',
					ETag: 'ETag',
					Size: 50,
				},
			],
		});

		await list({
			path,
			options: {
				targetIdentityId,
				accessLevel,
				pageSize,
				nextToken,
			},
		});
		// await list();

		expect(listObjectsV2).toBeCalledTimes(1);
		expect(listObjectsV2).toHaveBeenCalledWith(clientConfig, clientParams);
	});
});
