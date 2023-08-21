// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
//

// TODO(ashwinkumar6) this uses V5 Credentials, update to V6.
import { Credentials } from '@aws-sdk/types';
import { StorageAccessLevel } from '@aws-amplify/core';

export type StorageConfig = {
	region: string;
	credentials: Credentials;
};

export type StorageOptions =
	| { accessLevel?: 'guest' | 'private'; isObjectLockEnabled?: boolean }
	| {
			accessLevel: 'protected';
			targetIdentityId: string;
			isObjectLockEnabled?: boolean;
	  };

export type StorageOperationRequest<Options extends StorageOptions> = {
	key: string;
	options?: Options;
};

export type StorageListRequest<
	Options extends StorageListAllOptions | StorageListPaginateOptions
> = {
	path?: string;
	options?: Options;
};

export type StorageListAllOptions = StorageOptions & {
	listAll: true;
};

export type StorageListPaginateOptions = StorageOptions & {
	listAll?: false;
	pageSize?: number;
	nextToken?: string;
};

export type StorageDownloadDataRequest<Options extends StorageOptions> =
	StorageOperationRequest<Options>;

export type StorageDownloadFileParameter<Options extends StorageOptions> =
	StorageOperationRequest<Options> & {
		/**
		 * If supplied full file path in browsers(e.g. path/to/foo.bar)
		 * the directory will be stripped. However, full directory could be
		 * supported in RN.
		 */
		localFile: string;
	};

// TODO: open question whether we should treat uploadFile differently from uploadData
export type StorageUploadDataParameter<Options extends StorageOptions> =
	StorageOperationRequest<Options> & {
		data: Blob | BufferSource | FormData | URLSearchParams | string;
	};

// TODO: open question whether we should treat uploadFile differently from uploadData
export type StorageUploadFileParameter<Options extends StorageOptions> =
	StorageOperationRequest<Options> & {
		data: File;
	};

export type StorageRemoveOptions = StorageOptions;

export type StorageCopyRequest<CopyItem extends StorageCopyItem> = {
	source: CopyItem;
	destination: CopyItem;
};

export type StorageCopyItem = {
	key: string;
	accessLevel?: StorageAccessLevel;
};
