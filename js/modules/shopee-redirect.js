// Shopee Redirect Module
export function initShopeeRedirect() {
  const SHOP_URL_BASE = 'https://shopee.co.id/mall/search';
  const SHOP_ID = '1141068632';

  function slugKeyword(str) {
    if (!str) return '';
    return String(str)
      .trim()
      .toLowerCase()
      .replace(/[&/\\]+/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/[^a-z0-9\s-]/g, '');
  }

  function buildShopeeUrl(keyword) {
    const safeKeyword = slugKeyword(keyword);
    const params = new URLSearchParams({
      keyword: safeKeyword,
      shop: SHOP_ID,
    });
    return `${SHOP_URL_BASE}?${params.toString()}`;
  }

  document.querySelectorAll('.produk-category-card').forEach(card => {
    const labelEl = card.querySelector('span');
    const label = labelEl ? labelEl.textContent : card.dataset.category || '';
    const finalUrl = buildShopeeUrl(label || card.dataset.category || '');

    card.setAttribute('href', finalUrl);
    card.setAttribute('target', '_blank');
    card.setAttribute('rel', 'noopener noreferrer');
    card.setAttribute('aria-label', `Cari di Shopee: ${label}`);
  });
}