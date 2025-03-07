import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async ({ request, redirect }, next) => {
  const url = new URL(request.url);
  
  // Skip if URL already has trailing slash or has a file extension
  if (url.pathname.endsWith('/') || url.pathname.match(/\.[^/]+$/)) {
    return next();
  }

  // Redirect to URL with trailing slash
  return redirect(`${url.pathname}/${url.search}`, 301);
});