class URLSearchParamsCaseInsensitive extends URLSearchParams {
	append(name, value) {
		return super.append(name.toUpperCase(), value);
	}
	delete(name) {
		return super.delete(name.toUpperCase());
	}
	get(name) {
		return super.get(name.toUpperCase());
	}
	getAll(name) {
		return super.getAll(name.toUpperCase());
	}
	has(name) {
		return super.has(name.toUpperCase());
	}
	set(name, value) {
		return super.set(name.toUpperCase(), value);
	}
};

export default URLSearchParamsCaseInsensitive;
