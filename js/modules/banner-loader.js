// Banner Loader Module - Load banners from Google Sheets
const SHEETS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQxFTxGE9lCdi1zqAmOyP-zCKf-1WYhe7Bbq4XFyQtf2VLXtDLR_OysJrJuh6WOznIn5nMa9mGTD3Xw/pub?output=csv';
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

async function fetchGoogleSheetsData() {
  try {
    console.log('=== MENGAMBIL DATA DARI GOOGLE SHEETS ===');

    // Coba langsung dulu
    let response;
    try {
      response = await fetch(SHEETS_CSV_URL);
      if (response.ok) {
        console.log('Berhasil ambil data langsung!');
        return await response.text();
      }
    } catch (e) {
      console.log('Gagal langsung, coba pake proxy...');
    }

    // Coba pake proxy
    const proxyUrl = CORS_PROXY + encodeURIComponent(SHEETS_CSV_URL);
    response = await fetch(proxyUrl);
    const text = await response.text();
    return text;

  } catch (error) {
    console.error('Error ambil data:', error);
    return null;
  }
}

function parseBannerCSV(csvText) {
  if (!csvText) return [];

  const lines = csvText.trim().split(/\r?\n/);
  console.log('Total baris:', lines.length);

  const banners = [];

  // Skip header (baris 1), mulai dari baris 2
  // Sesuai ketentuan: pakai kolom 2 untuk image (index 2) dan kolom 3 untuk link (index 3)
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cols = line.split(',');
    if (cols.length >= 3) {
      let imgUrl = cols[2].trim();
      let link = cols[3].trim();

      // Jika link kosong, pakai imgUrl sebagai link
      if (!link) link = imgUrl;

      banners.push({
        image_url: imgUrl,
        link: link
      });
    }
  }

  console.log('Banner berhasil di-parse:', banners.length);
  return banners;
}

export async function loadBannersFromSheet() {
  const bannerSlides = document.querySelector('.banner-slides');
  if (!bannerSlides) return;

  console.log('=== MULAI AMBILE BANNER DARI SHEET ===');

  try {
    const csvData = await fetchGoogleSheetsData();
    const banners = parseBannerCSV(csvData);

    if (banners.length > 0) {
      // Simpan default slides dulu sebelum clear
      const hasDefaultSlides = bannerSlides.children.length > 0;

      // Tunggu loading selesai sebelum replace
      const loadingClone = bannerSlides.parentElement.querySelector('.banner-loading')?.cloneNode(true);
      if (loadingClone) bannerSlides.parentElement.appendChild(loadingClone);

      bannerSlides.style.opacity = '0';
      setTimeout(() => {
        bannerSlides.innerHTML = '';

        // Buat slide baru dari Google Sheets - masing-masing di slide terpisah
        banners.forEach(function(url, index) {
          const slide = document.createElement('div');
          slide.className = 'banner-slide';

          // item sekarang bentuknya: { image_url, link }
          const item = url;

          const mediaUrl = item.image_url;
          const clickUrl = item.link || item.image_url;

          const a = document.createElement('a');
          a.href = clickUrl;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';

          const isYoutube = /youtu\.be|youtube\.com/i.test(mediaUrl);
          const isVideoFile = /\.(mp4|webm|ogg)(\?|#|$)/i.test(mediaUrl);

          if (isYoutube) {
            const iframe = document.createElement('iframe');
            const embedSrc = mediaUrl
              .replace('watch?v=', 'embed/')
              .replace('youtu.be/', 'embed/');

            iframe.src = embedSrc;
            iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
            iframe.allowFullscreen = true;
            iframe.style.cssText = 'width:100%;height:100%;border:none;display:block;';
            a.appendChild(iframe);
          } else if (isVideoFile) {
            const video = document.createElement('video');
            video.src = mediaUrl;
            video.controls = true;
            video.playsInline = true;
            video.muted = true; // agar aman di beberapa browser
            video.preload = 'metadata';
            video.style.cssText = 'width:100%;height:100%;object-fit:cover;display:block;';
            a.appendChild(video);
          } else {
            const img = document.createElement('img');
            img.src = mediaUrl;
            img.alt = 'Banner ' + (index + 1);

            img.onerror = function() {
              console.log('Gagal load media dari sheet:', mediaUrl);
            };

            a.appendChild(img);
          }

          slide.appendChild(a);
          bannerSlides.appendChild(slide);
        });

        // Update dots
        const dotsContainer = document.querySelector('.banner-dots');
        if (dotsContainer) {
          dotsContainer.innerHTML = '';
          banners.forEach(function(_, i) {
            const dot = document.createElement('button');
            dot.className = 'banner-dot' + (i === 0 ? ' active' : '');
            dot.setAttribute('data-index', i);
            dot.setAttribute('aria-label', 'Slide ' + (i + 1));
            dotsContainer.appendChild(dot);
          });
        }

        bannerSlides.style.opacity = '1';
        if (loadingClone) loadingClone.remove();
      }, 100);
    } else {
      console.log('Tidak ada banner dari Sheet, pakai default (sudah ada di HTML)');
    }
  } catch (e) {
    console.log('Gagal ambil dari Sheet, pakai default banner yang sudah ada di HTML');
    // Jangan lakukan apa-apa - biarkan default slides tetap di HTML
  }
}