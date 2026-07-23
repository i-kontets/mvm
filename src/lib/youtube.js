export const youtubeThumbnail = url => {
  try {
    const parsed = new URL(url);
    const id = parsed.hostname === 'youtu.be'
      ? parsed.pathname.slice(1)
      : parsed.searchParams.get('v') || parsed.pathname.split('/').filter(Boolean).at(-1);

    return id && /^[\w-]{11}$/.test(id)
      ? `https://img.youtube.com/vi/${id}/hqdefault.jpg`
      : null;
  } catch {
    return null;
  }
};
