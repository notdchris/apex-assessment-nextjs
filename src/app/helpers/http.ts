export const httpFetch = async (url: string, method: string, data?: any) => {
  let queryParams = '';

  if (data && method.toUpperCase() === 'GET') {
    const queryString = Object.keys(data)
      .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`)
      .join('&');

    queryParams = `?${queryString}`;
  }

  const fullUrl = `${url}${queryParams}`;

  const res = await fetch(fullUrl, {
    method: method,
    headers: {
      'Content-Type': 'application/json'
    },

    body: method.toUpperCase() !== 'GET' ? JSON.stringify(data) : undefined,
  });

  return res.json();
}
