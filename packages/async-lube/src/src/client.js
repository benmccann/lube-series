/** @param {Record<string, string | number>} [data] */
const to_query = data => {
	let query = ""
	if (data) {
		for (const key in data) {
			query += (query ? "&" : "") + encodeURIComponent(key) + "=" + encodeURIComponent(data[key])
		}
	}
	return query
}

/** @param {Record<string, string | Blob>} [data] */
const to_form_data = data => {
	if (data) {
		const form_data = new FormData()
		for (const key in data) form_data.append(key, data[key])
		return form_data
	}
}

const path_variable_regex = /:[_a-zA-Z0-9]+/g
/**
 * @param {string} url
 * @param {Record<string, string | number | Blob>} [data]
 */
const set_path_variables_in_url = (url, data) => {
	if (data) {
		url = url.replace(
			path_variable_regex,
			s => {
				s = s.slice(1)
				const v = data[s]
				delete data[s]
				return String(v)
			}
		)
	}
	return url
}

/**
 * @param {string} url
 * @param {(abort: VoidFunction) => void} [set_abort]
 * @param {RequestInit} [options]
 * @param {string} [query]
 * @param {Record<string, string>} [headers]
 * @returns
 */
const get_fetch_query = (url, set_abort, options, query, headers) => {
	options = {
		...options,
		headers
	}
	if (set_abort) {
		const controller = new AbortController()
		set_abort(() => controller.abort())
		options.signal = controller.signal
	}
	return fetch(url + (query ? "?" + query : ""), options)
}

/**
 * @param {string} url
 * @param {"DELETE" | "HEAD" | "OPTIONS" | "PATCH" | "POST" | "PUT"} method
 * @param {string} content_type
 * @param {(abort: VoidFunction) => void} [set_abort]
 * @param {RequestInit} [options]
 * @param {string | FormData} [body]
 * @param {Record<string, string>} [headers]
 * @returns
 */
const get_fetch_body = (url, method, content_type, set_abort, options, body, headers) => {
	headers = {
		"Content-Type": content_type,
		...headers
	}
	options = {
		...options,
		method,
		body,
		headers
	}
	if (set_abort) {
		const controller = new AbortController()
		set_abort(() => controller.abort())
		options.signal = controller.signal
	}
	return fetch(url, options)
}

/**
 * @param {string} url
 * @param {"DELETE" | "HEAD" | "OPTIONS" | "PATCH" | "POST" | "PUT"} method
 * @param {(abort: VoidFunction) => void} [set_abort]
 * @param {RequestInit} [options]
 * @returns
 */
const set_options_body = (url, method, set_abort, options) =>
	({
		/**
		 * Function for making a JSON fetch request with optional data and headers.
		 * @param {Record<string, string | number>} [data] Optional data to be sent with the JSON request.
		 * @param {Record<string, string>} [headers] Optional headers to be included in the JSON request.
		 * @returns A Promise containing the response.
		 */
		json: (data, headers) =>
			get_fetch_body(
				set_path_variables_in_url(url, data),
				method,
				"application/json;charset=UTF-8",
				set_abort,
				options,
				JSON.stringify(data),
				headers
			),

		/**
		 * Function for making a multipart fetch request with optional data and headers.
		 *
		 * Accepts File objects as values in the `data` parameter.
		 * @param {Record<string, string | Blob>} [data] Optional data to be sent with the multipart request.
		 * @param {Record<string, string>} [headers] Optional headers to be included in the multipart request.
		 * @returns A Promise containing the response.
		 */
		multiPart: (data, headers) =>
			get_fetch_body(
				set_path_variables_in_url(url, data),
				method,
				"multipart/form-data;charset=UTF-8",
				set_abort,
				options,
				to_form_data(data),
				headers
			),

		/**
		 * Function for making a URL-encoded fetch request with optional data and headers.
		 * @param  {Record<string, string | number>} [data] Optional data to be sent with the URL-encoded request.
		 * @param {Record<string, string>} [headers] Optional headers to be included in the URL-encoded request.
		 * @returns A Promise containing the response.
		 */
		urlEncoded: (data, headers) =>
			get_fetch_body(
				set_path_variables_in_url(url, data),
				method,
				"application/x-www-form-urlencoded;charset=UTF-8",
				set_abort,
				options,
				to_query(data),
				headers
			)
	})

/**
 * Function that creates an HTTP client for a specific URL with optional abort callback.
 *
 * Returns an object containing various HTTP methods.
 * @param {string} url The URL to create the HTTP client for.
 * @param {(abort: VoidFunction) => void} [set_abort] An optional callback function to abort the request.
 * @returns An object containing various HTTP methods.
 */
export default (url, set_abort) =>
	({
		/**
		 * HTTP GET method.
		 * @param {RequestInit} [options] Optional configuration options for the request.
		 * @returns An object containing the `query` function for call `Fetch` with query parameters.
		 */
		get: options => ({
			/**
			 * Function for making a GET fetch request with optional data and headers.
			 *
			 * Returns a Promise containing the response.
			 * @param {Record<string, string | number>} [data] Optional data to be sent with the GET request.
			 * @param {Record<string, string>} [headers] Optional headers to be included in the GET request.
			 * @returns A Promise containing the response.
			 */
			query: (data, headers) =>
				get_fetch_query(
					set_path_variables_in_url(url, data),
					set_abort,
					options,
					to_query(data),
					headers
				)
		}),

		/**
		 * HTTP DELETE method.
		 * @param {RequestInit} [options] Optional configuration options for the request.
		 * @returns An object containing the `json`, `multiPart`, `urlEncoded` function
		 * for call `Fetch` with body parameters.
		 */
		delete: options => set_options_body(url, "DELETE", set_abort, options),

		/**
		 * HTTP HEAD method.
		 * @param {RequestInit} [options] Optional configuration options for the request.
		 * @returns An object containing the `json`, `multiPart`, `urlEncoded` function
		 * for call `Fetch` with body parameters.
		 */
		head: options => set_options_body(url, "HEAD", set_abort, options),
		
		/**
		 * HTTP OPTIONS method.
		 * @param {RequestInit} [options] Optional configuration options for the request.
		 * @returns An object containing the `json`, `multiPart`, `urlEncoded` function
		 * for call `Fetch` with body parameters.
		 */
		options: options => set_options_body(url, "OPTIONS", set_abort, options),
		
		/**
		 * HTTP PATCH method.
		 * @param {RequestInit} [options] Optional configuration options for the request.
		 * @returns An object containing the `json`, `multiPart`, `urlEncoded` function
		 * for call `Fetch` with body parameters.
		 */
		patch: options => set_options_body(url, "PATCH", set_abort, options),
		
		/**
		 * HTTP POST method.
		 * @param {RequestInit} [options] Optional configuration options for the request.
		 * @returns An object containing the `json`, `multiPart`, `urlEncoded` function
		 * for call `Fetch` with body parameters.
		 */
		post: options => set_options_body(url, "POST", set_abort, options),
		
		/**
		 * HTTP PUT method.
		 * @param {RequestInit} [options] Optional configuration options for the request.
		 * @returns An object containing the `json`, `multiPart`, `urlEncoded` function
		 * for call `Fetch` with body parameters.
		 */
		put: options => set_options_body(url, "PUT", set_abort, options)
	})