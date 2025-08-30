import { defineMiddleware } from 'astro:middleware';

export const onRequest = defineMiddleware(async ({ request, redirect }, next) => {
  const url = new URL(request.url);
  
  // Redirect /afiliado/* to home
  if (url.pathname.startsWith('/afiliado/')) {
    return redirect('/', 301);
  }
  
  // Skip if URL already has trailing slash or has a file extension
  if (url.pathname.endsWith('/') || url.pathname.match(/\.[^/]+$/)) {
    return next();
  }
  
  // Skip trailing slash redirect for home page
  if (url.pathname === '') {
    return next();
  }

  // Redirect to URL with trailing slash
  return redirect(`${url.pathname}/${url.search}`, 301);
});