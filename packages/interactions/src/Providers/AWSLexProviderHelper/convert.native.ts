/*
 * Copyright 2017-2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

import { decode } from 'base-64';

export const convert = (stream: Blob): Promise<Uint8Array> => {
	return new Promise(async (res, rej) => {
		const blobURL = URL.createObjectURL(stream);
		const request = new XMLHttpRequest();
		request.responseType = 'arraybuffer';
		request.onload = _event => {
			return res(new Uint8Array(request.response));
		};
		request.onerror = rej;
		request.open('GET', blobURL, true);
		request.send();
	});
};

export const base64ToArrayBuffer = (base64: string): Uint8Array => {
	const binaryString: string = decode(base64);
	return Uint8Array.from(binaryString, c => c.charCodeAt(0));
};
