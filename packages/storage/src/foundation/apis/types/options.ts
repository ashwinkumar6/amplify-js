// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { AWSCredentials } from '@aws-amplify/core/internals/utils';

export interface BucketInfo {
	bucketName: string;
	region: string;
}

export type CredentialsProvider = () => Promise<{
	credentials: AWSCredentials;
}>;
