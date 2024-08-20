export function parseCookies(req) {
    // Cookie string from the request headers
    const cookieString = req.headers.get('cookie') || '';
    return Object.fromEntries(
      cookieString.split('; ').map(cookie => {
        const [key, value] = cookie.split('=');
        return [key, decodeURIComponent(value)];
      })
    );
  }
  