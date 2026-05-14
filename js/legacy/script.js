// Wait for DOM
document.addEventListener('DOMContentLoaded', function() {
  
  // ==================== GOOGLE SHEETS BANNER ====================
  // Link CSV dari Sheet: File → Share → Publish to web → CSV
  const SHEETS_CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQxFTxGE9lCdi1zqAmOyP-zCKf-1WYhe7Bbq4XFyQtf2VLXtDLR_OysJrJuh6WOznIn5nMa9mGTD3Xw/pub?output=csv';
  
  // CORS proxy alternatif
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

      // image_url = kolom ke-3 (index 2)
      // link = kolom ke-4 (index 3)
      if (cols.length >= 4) {
        let imgUrl = cols[2].trim();
        let link = cols[3].trim();

        // Hapus tanda kutip
        imgUrl = imgUrl.replace(/^"|"$/g, '');
        link = link.replace(/^"|"$/g, '');

        if (imgUrl && imgUrl.startsWith('http')) {
          banners.push({ image_url: imgUrl, link: link || imgUrl });
          console.log('Banner ' + banners.length + ':', imgUrl, '->', link || imgUrl);
        }
      }
    }

    return banners;
  }

  
async function loadBannersFromSheet() {
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
          // Call carousel init setelah slides siap
          if (typeof initBannerCarousel === 'function') initBannerCarousel();
        }, 100);
      } else {
        console.log('Tidak ada banner dari Sheet, pakai default (sudah ada di HTML)');
      }
    } catch (e) {
      console.log('Gagal ambil dari Sheet, pakai default banner yang sudah ada di HTML');
      // Jangan lakukan apa-apa - biarkan default slides tetap di HTML
    }
  }
  
  // ==================== BANNER CAROUSEL ====================
  let bannerCarouselInterval = null;
  
  function initBannerCarousel() {
    const bannerSlides = document.querySelector('.banner-slides');
    const bannerDots = document.querySelector('.banner-dots');
    const prevBtn = document.querySelector('.banner-prev');
    const nextBtn = document.querySelector('.banner-next');
    
    if (!bannerSlides || !bannerDots) return;
    
    const slides = bannerSlides.querySelectorAll('.banner-slide');
    if (slides.length === 0) return;
    
    console.log('=== INIT CAROUSEL DENGAN ' + slides.length + ' SLIDE ===');
    
    let currentSlide = 0;
    const totalSlides = slides.length;
    
    function updateCarousel() {
      bannerSlides.style.transform = 'translateX(-' + (currentSlide * 100) + '%)';
      document.querySelectorAll('.banner-dot').forEach(function(dot, i) {
        dot.classList.toggle('active', i === currentSlide);
      });
    }
    
    if (prevBtn) prevBtn.addEventListener('click', function() {
      currentSlide = currentSlide === 0 ? totalSlides - 1 : currentSlide - 1;
      updateCarousel();
    });
    
    if (nextBtn) nextBtn.addEventListener('click', function() {
      currentSlide = currentSlide === totalSlides - 1 ? 0 : currentSlide + 1;
      updateCarousel();
    });
    
    document.querySelectorAll('.banner-dot').forEach(function(dot, i) {
      dot.addEventListener('click', function() {
        currentSlide = i;
        updateCarousel();
      });
    });
    
    // Autoplay dimatikan (manual swap via panah/dots/swipe).
    function goNext(){
      currentSlide = currentSlide === totalSlides - 1 ? 0 : currentSlide + 1;
      updateCarousel();
    }

    function goPrev(){
      currentSlide = currentSlide === 0 ? totalSlides - 1 : currentSlide - 1;
      updateCarousel();
    }


    // Touch swipe support for mobile
    let startX = 0;
    let endX = 0;

    bannerSlides.addEventListener('touchstart', function(e) {
      stopAutoPlay();
      startX = e.touches[0].clientX;
    });
    
    bannerSlides.addEventListener('touchend', function(e) {

      endX = e.changedTouches[0].clientX;
      const diffX = startX - endX;
      const minSwipe = 50; // Minimum swipe distance
      
      if (Math.abs(diffX) > minSwipe) {
        if (diffX > 0) {
          // Swipe left - next slide
          currentSlide = currentSlide === totalSlides - 1 ? 0 : currentSlide + 1;
        } else {
          // Swipe right - prev slide
          currentSlide = currentSlide === 0 ? totalSlides - 1 : currentSlide - 1;
        }
        updateCarousel();
      }
    });

    
    console.log('Banner: Manual mode (no auto-slide, arrows/dots/swipe OK!)');
  }
  
  // Init Sistem Banner
  async function initBannerSystem() {
    await loadBannersFromSheet();
    setTimeout(initBannerCarousel, 1000);
  }
  
  initBannerSystem();
  
// ==================== THEME & LANGUAGE TOGGLES ====================
  // Theme Toggle
  // Toggle button ada di elemen #themeToggle (di nav-right-controls)
  const themeToggle = document.getElementById('themeToggle');
  const body = document.body;

  function syncThemeUI(isDark) {
    if (!themeToggle) return;
    if (isDark) body.classList.add('dark-mode');
    else body.classList.remove('dark-mode');

    // class ini dipakai di css/dark-mode.css untuk styling tombol
    themeToggle.classList.toggle('dark-mode', isDark);
  }

  function initTheme() {

    const savedTheme = localStorage.getItem('theme') || 'light';
    if (savedTheme === 'dark') {
      body.classList.add('dark-mode');
      themeToggle.classList.add('dark-mode');
    }
  }
  
  function toggleTheme() {
    body.classList.toggle('dark-mode');
    themeToggle.classList.toggle('dark-mode');
    const isDark = body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }
  
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
    initTheme();
  }
  
  // Language Toggle
  const langToggle = document.getElementById('langToggle');
  const langDropdown = document.getElementById('langDropdown');
  const langs = ['id', 'en', 'es', 'ar', 'ja', 'ko', 'zh'];
  
  const translations = {
    id: {
      // Navbar links
      'nav.home': 'Home',
      'nav.banner': 'Banner',
      'nav.profil': 'Profil',
      'nav.visi-misi': 'Visi & Misi',
      'nav.layanan': 'Layanan',
      'nav.produk': 'Produk',
      'nav.shopping': 'Shopping',
      'nav.review': 'Review',
      'nav.kontak': 'Kontak',
      
      // Hero
      'hero.subtitle': 'Welcome to',
      'hero.title': 'Harris Electronic',
      'hero.desc': 'Sahabat Elektronikmu Yang Terpercaya',
      'hero.btn': 'Lihat Produk Kami',
      
      // Sections
      'section.profil': 'Profil Perusahaan',
      'profil.title': 'Tentang Harris Elektronik',
      'profil.summary': 'Harris Electronic adalah sebuah retail perusahaan menjual produk - produk elektronik & rumah tangga yang menyediakan kebutuhan konsumen langsung di bawah naungan PT. Mitra Electronic Perkasa sebagai distributor resmi dari beberapa merek / brand elektronik di Indonesia yang mendistribusikan produk - produk elektronik besar maupun elektronik kecil kepada tangan ke-3 yang dimana biasa di sebut sebagai Sub-Dealer sudah bekerja sama sekitar 270 outlet di Jawa barat dan sekitarnya.',
      'profil.full1': 'Harris Electronic memiliki tujuan agar bisa memenuhi kebutuhan konsumen langsung dengan lengkap dan cepat, agar bisa memberikan & memenuhi kepuasan maupun kebutuhan terhadap konsumen langsung produk elektronik dan peralatan rumah tangga, kami ingin memperluas jangkauan kepada konsumen langsung.',
      'profil.full2': 'Perusahaan kami sudah berkecimpung didunia elektronik & parabola sejak 1992 yang dikenal dengan nama SONY ELECTRONIC, dengan seiringnya waktu terus berkembang pesatnya penjualan dan tatatertib usaha secara undang - undang negara, mengharuskan kami untuk membentuk badan usaha yang bernama PT. Mitra Electronic Perkasa pada tahun 2016 yang sampai saat ini masih beroperasi menjual produk - produk elektronik  secara distribusi maupun secara retail konsumen langsung.',
      'read.more': 'Baca Selengkapnya',
      'profil.btn': 'Hubungi Kami',
      'profil.link': 'Hubungi Kami',

      
      'section.visi-misi': 'Visi & Misi',
      'visi.title': 'Visi',
      'visi.desc': 'Memenuhi Kebutuhan konsumen langsung dengan lengkap dan cepat, sehingga konsumen bisa memenuhi kebutuhannya dengan lengkap dan cepat.',
      'misi.title': 'Misi',
      'misi.desc': 'Meningkatkan citra diri dan nilai tawar dimata konsumen guna memberikan pelayanan jasa distribusi maupun pelayanan retail kepada konsumen. Menargetkan untuk selalu memperluas jangkauan agar bisa lebih cepat memenuhi kebutuhan konsumen',
      
      'section.layanan': 'Layanan Kami',
      'layanan.penjualan': 'Penjualan',
      'layanan.penjualan.desc': 'Penjualan lengkap berbagai produk elektronik rumah tangga.',
      'layanan.service': 'Service',
      'layanan.service.desc': 'Layanan perbaikan dan maintenance produk elektronik.',
      'layanan.pengiriman': 'Pengiriman',
      'layanan.pengiriman.desc': 'Pengiriman cepat ke seluruh wilayah Indonesia.',
      'layanan.cicilan': 'Cicilan',
      'layanan.cicilan.desc': 'Fasilitas cicilan 0% dengan kartu kredit dan e-wallet.',
      
      'section.produk': 'Produk',
      'brand.title': 'Brand Official',
      
      'section.shopping': 'Belanja Sekarang',
      'shopping.more': 'Lihat Semua di Shopee',
      
      'section.review': 'Apa Kata Pelanggan',
      'review.total': 'Total Ulasan',
      'review.rating': 'Rating Rata-rata',
      'review.puas': '% Pelanggan Puas',
      
      'section.kontak': 'Kontak',
      'kontak.title': 'Kirim Pesan (Pilih WA atau Email)',
      'kontak.nama': 'Nama Lengkap',
      'kontak.email': 'Email',
      'kontak.telpon': 'No. Telepon / WA',
      'kontak.pesan': 'Pesan Anda...',
      'kontak.submit': 'Kirim Pesan',
      'kontak.note': 'Pesan akan terkirim otomatis ke WA resmi Harris Elektronik atau email kami.',
      
      'kontak.alamat': 'Alamat',
      'kontak.telepon': 'Telepon',
      'kontak.email': 'Email',
      'kontak.whatsapp': 'WhatsApp',
      'kontak.loker': '💼 Lowongan Kerja',
      'kontak.follow': 'Ikuti Kami:',
      
      'footer.rights': '&copy; 2026 Harris Elektronik. All rights reserved.',
      'footer.desc': 'Distributor terpercaya peralatan rumah tangga sejak 2005.'
    },
    en: {
      'nav.home': 'Home',
      'nav.banner': 'Banner',
      'nav.profil': 'Profile',
      'nav.visi-misi': 'Vision & Mission',
      'nav.layanan': 'Services',
      'nav.produk': 'Products',
      'nav.shopping': 'Shopping',
      'nav.review': 'Reviews',
      'nav.kontak': 'Contact',
      
      'hero.subtitle': 'Welcome to',
      'hero.title': 'Harris Electronic',
      'hero.desc': 'Your Trusted Electronics Partner',
      'hero.btn': 'View Our Products',
      
      'section.profil': 'Company Profile',
      'profil.title': 'About Harris Electronic',
      'profil.summary': 'Harris Electronic is a retail company selling electronic products & household appliances that provides direct consumer needs under the auspices of PT. Mitra Electronic Perkasa as an official distributor of several electronic brands / brands in Indonesia which distributes large and small electronic products to third parties which are usually called Sub-Dealers who have cooperated around 270 outlets in West Java and surroundings.',
      'profil.full1': 'Harris Electronic aims to meet direct consumer needs completely and quickly, to provide and meet satisfaction and needs for direct consumers of electronic products and household appliances, we want to expand the reach to direct consumers.',
      'profil.full2': 'Our company has been involved in the electronics & parabola world since 1992 known as SONY ELECTRONIC, with the passage of time the rapid development of sales and business discipline according to state laws, requiring us to form a business entity named PT. Mitra Electronic Perkasa in 2016 which until now is still operating selling electronic products both in distribution and direct retail consumers.',
      'read.more': 'Read More',
      'profil.btn': 'Contact Us',
      
      'section.visi-misi': 'Vision & Mission',
      'visi.title': 'Vision',
      'visi.desc': 'Meet direct consumer needs completely and quickly, so consumers can meet their needs completely and quickly.',
      'misi.title': 'Mission',
      'misi.desc': 'Improve self-image and value proposition in the eyes of consumers to provide distribution service or retail service to consumers. Target to always expand reach to be able to meet consumer needs faster',
      
      'section.layanan': 'Our Services',
      'layanan.penjualan': 'Sales',
      'layanan.penjualan.desc': 'Complete sales of various household electronic products.',
      'layanan.service': 'Service',
      'layanan.service.desc': 'Repair and maintenance services for electronic products.',
      'layanan.pengiriman': 'Delivery',
      'layanan.pengiriman.desc': 'Fast delivery to all regions in Indonesia.',
      'layanan.cicilan': 'Installment',
      'layanan.cicilan.desc': '0% installment facility with credit cards and e-wallets.',
      
      'section.produk': 'Products',
      'brand.title': 'Official Brands',
      
      'section.shopping': 'Shop Now',
      'shopping.more': 'See All on Shopee',
      
      'section.review': 'What Customers Say',
      'review.total': 'Total Reviews',
      'review.rating': 'Average Rating',
      'review.puas': '% Satisfied Customers',
      
      'section.kontak': 'Contact',
      'kontak.title': 'Send Message (Choose WA or Email)',
      'kontak.nama': 'Full Name',
      'kontak.email': 'Email',
      'kontak.telpon': 'Phone Number / WA',
      'kontak.pesan': 'Your Message...',
      'kontak.submit': 'Send Message',
      'kontak.note': 'Message will be sent automatically to Harris Elektronik official WA or our email.',
      
      'kontak.alamat': 'Address',
      'kontak.telepon': 'Phone',
      'kontak.whatsapp': 'WhatsApp',
      'kontak.loker': '💼 Job Vacancy',
      'kontak.follow': 'Follow Us:',
      
      'footer.rights': '&copy; 2026 Harris Electronic. All rights reserved.',
      'footer.desc': 'Trusted household appliances distributor since 2005.'
    },
    es: {
      'nav.home': 'Inicio', 'nav.banner': 'Banner', 'nav.profil': 'Perfil', 'nav.visi-misi': 'Visión & Misión',
      'nav.layanan': 'Servicios', 'nav.produk': 'Productos', 'nav.shopping': 'Compras', 'nav.review': 'Reseñas', 
      'nav.kontak': 'Contacto', 'hero.subtitle': 'Bienvenido a', 'hero.title': 'Harris Electronic', 
      'hero.desc': 'Tu Socio Confiable en Electrónica', 'hero.btn': 'Ver Nuestros Productos', 'section.profil': 'Perfil de la Empresa',
      'profil.title': 'Sobre Harris Electronic', 'read.more': 'Leer Más', 'section.visi-misi': 'Visión & Misión', 
      'visi.title': 'Visión', 'visi.desc': 'Satisfacer las necesidades del consumidor directamente de manera completa y rápida',
      'misi.title': 'Misión', 'misi.desc': 'Mejorar la imagen y el valor ante los consumidores para ofrecer servicios de distribución y retail',
      'section.layanan': 'Nuestros Servicios', 'layanan.penjualan': 'Ventas', 'layanan.penjualan.desc': 'Venta completa de productos electrónicos del hogar',
      'layanan.service': 'Servicio', 'layanan.service.desc': 'Servicios de reparación y mantenimiento de productos electrónicos',
      'layanan.pengiriman': 'Envío', 'layanan.pengiriman.desc': 'Envío rápido a toda Indonesia', 'layanan.cicilan': 'Cuotas',
      'layanan.cicilan.desc': 'Facilidad de pago a plazos 0% con tarjetas de crédito y billeteras electrónicas', 'section.produk': 'Productos',
      'brand.title': 'Marcas Oficiales', 'section.shopping': 'Comprar Ahora', 'shopping.more': 'Ver Todo en Shopee',
      'section.review': 'Qué Dicen Nuestros Clientes', 'review.total': 'Total Reseñas', 'review.rating': 'Rating Promedio',
      'review.puas': '% Clientes Satisfechos', 'section.kontak': 'Contacto', 'kontak.title': 'Enviar Mensaje (WA o Email)',
      'kontak.nama': 'Nombre Completo', 'kontak.email': 'Email', 'kontak.telpon': 'Teléfono / WA', 'kontak.pesan': 'Tu Mensaje...',
      'kontak.submit': 'Enviar Mensaje', 'kontak.note': 'El mensaje se enviará automáticamente al WA oficial o email', 'kontak.alamat': 'Dirección',
      'kontak.telepon': 'Teléfono', 'kontak.whatsapp': 'WhatsApp', 'kontak.loker': '💼 Vacantes Laborales', 'kontak.follow': 'Síguenos:',
      'footer.rights': '© 2026 Harris Elektronik. Todos los derechos reservados.', 'footer.desc': 'Distribuidor confiable de electrodomésticos desde 2005'
    },
    ar: {
      'nav.home': 'الرئيسية', 'nav.banner': 'بانر', 'nav.profil': 'الملف الشخصي', 'nav.visi-misi': 'رؤية ومهمة',
      'nav.layanan': 'الخدمات', 'nav.produk': 'المنتجات', 'nav.shopping': 'التسوق', 'nav.review': 'المراجعات', 
      'nav.kontak': 'اتصل بنا', 'hero.subtitle': 'مرحباً بك في', 'hero.title': 'هاريس إلكترونيك', 
      'hero.desc': 'شريكك الموثوق في الإلكترونيات', 'hero.btn': 'عرض منتجاتنا', 'section.profil': 'ملف الشركة',
      'profil.title': 'حول هاريس إلكترونيك', 'read.more': 'اقرأ المزيد', 'section.visi-misi': 'رؤية ومهمة', 
      'visi.title': 'الرؤية', 'visi.desc': 'تلبية احتياجات المستهلك مباشرة بكفاءة وسرعة', 'misi.title': 'المهمة', 
      'misi.desc': 'تحسين الصورة والقيمة لتقديم خدمات توزيع وبيع بالتجزئة', 'section.layanan': 'خدماتنا', 
      'layanan.penjualan': 'المبيعات', 'layanan.penjualan.desc': 'بيع كامل للمنتجات الإلكترونية المنزلية',
      'layanan.service': 'الخدمة', 'layanan.service.desc': 'خدمات إصلاح وصيانة المنتجات الإلكترونية', 
      'layanan.pengiriman': 'الشحن', 'layanan.pengiriman.desc': 'شحن سريع لكل إندونيسيا', 'layanan.cicilan': 'التقسيط',
      'layanan.cicilan.desc': 'تسهيلات التقسيط 0% بالبطاقات الائتمانية والمحافظ الإلكترونية', 'section.produk': 'المنتجات',
      'brand.title': 'العلامات التجارية الرسمية', 'section.shopping': 'تسوق الآن', 'shopping.more': 'عرض الكل في Shopee',
      'section.review': 'ما يقوله العملاء', 'review.total': 'إجمالي المراجعات', 'review.rating': 'التقييم المتوسط',
      'review.puas': 'نسبة العملاء الراضين %', 'section.kontak': 'اتصل بنا', 'kontak.title': 'إرسال رسالة (واتساب أو البريد)',
      'kontak.nama': 'الاسم الكامل', 'kontak.email': 'البريد الإلكتروني', 'kontak.telpon': 'رقم الهاتف / واتساب', 
      'kontak.pesan': 'رسالتك...', 'kontak.submit': 'إرسال الرسالة', 'kontak.note': 'الرسالة سترسل تلقائياً إلى واتساب أو بريدنا الرسمي',
      'kontak.alamat': 'العنوان', 'kontak.telepon': 'الهاتف', 'kontak.whatsapp': 'واتساب', 'kontak.loker': '💼 فرص عمل', 
      'kontak.follow': 'تابعنا:', 'footer.rights': '© 2026 هاريس إلكترونيك. جميع الحقوق محفوظة', 
      'footer.desc': 'موزع موثوق للأجهزة المنزلية منذ 2005'
    },
    ja: {
      'nav.home': 'ホーム', 'nav.banner': 'バナー', 'nav.profil': 'プロフィール', 'nav.visi-misi': 'ビジョン&ミッション',
      'nav.layanan': 'サービス', 'nav.produk': '製品', 'nav.shopping': 'ショッピング', 'nav.review': 'レビュー', 
      'nav.kontak': '連絡先', 'hero.subtitle': 'ようこそ', 'hero.title': 'ハリスエレクトロニック', 
      'hero.desc': '信頼できる電子機器のパートナー', 'hero.btn': '製品を見る', 'section.profil': '会社概要',
      'profil.title': 'ハリスエレクトロニックについて', 'read.more': '詳細を読む', 'section.visi-misi': 'ビジョン&ミッション', 
      'visi.title': 'ビジョン', 'visi.desc': '消費者ニーズを迅速かつ完全に対応', 'misi.title': 'ミッション', 
      'misi.desc': '流通・小売サービスのイメージ向上', 'section.layanan': '当社のサービス', 'layanan.penjualan': '販売', 
      'layanan.penjualan.desc': '家庭用電子機器の完全販売', 'layanan.service': 'サービス', 'layanan.service.desc': '電子機器の修理・メンテナンス',
      'layanan.pengiriman': '配送', 'layanan.pengiriman.desc': 'インドネシア全土への迅速配送', 'layanan.cicilan': '分割払い',
      'layanan.cicilan.desc': 'クレジットカード・eウォレットで0%分割', 'section.produk': '製品', 'brand.title': '公式ブランド', 
      'section.shopping': '今すぐショッピング', 'shopping.more': 'Shopeeで全商品を見る', 'section.review': 'お客様の声', 
      'review.total': '総レビュー数', 'review.rating': '平均評価', 'review.puas': '満足顧客 %', 'section.kontak': 'お問い合わせ', 
      'kontak.title': 'メッセージ送信（WhatsApp/Email選択）', 'kontak.nama': 'フルネーム', 'kontak.email': 'メール', 
      'kontak.telpon': '電話/WA番号', 'kontak.pesan': 'メッセージ...', 'kontak.submit': 'メッセージ送信', 
      'kontak.note': '公式WhatsAppまたはメールに自動送信', 'kontak.alamat': '住所', 'kontak.telepon': '電話', 
      'kontak.whatsapp': 'WhatsApp', 'kontak.loker': '💼 求人情報', 'kontak.follow': 'フォロー：', 
      'footer.rights': '© 2026 Harris Elektronik. 全権利所有', 'footer.desc': '2005年からの信頼できる家電ディストリビューター'
    },
    ko: {
      'nav.home': '홈', 'nav.banner': '배너', 'nav.profil': '프로필', 'nav.visi-misi': '비전&미션',
      'nav.layanan': '서비스', 'nav.produk': '제품', 'nav.shopping': '쇼핑', 'nav.review': '리뷰', 
      'nav.kontak': '연락처', 'hero.subtitle': '환영합니다', 'hero.title': '해리스 일렉트로닉', 
      'hero.desc': '신뢰할 수 있는 전자제품 파트너', 'hero.btn': '제품 보기', 'section.profil': '회사 소개',
      'profil.title': '해리스 일렉트로닉 소개', 'read.more': '자세히 보기', 'section.visi-misi': '비전&미션', 
      'visi.title': '비전', 'visi.desc': '소비자 요구 완벽하고 신속히 충족', 'misi.title': '미션', 
      'misi.desc': '유통·소매 서비스 이미지 및 가치 향상', 'section.layanan': '서비스', 'layanan.penjualan': '판매', 
      'layanan.penjualan.desc': '가전제품 완벽 판매', 'layanan.service': '서비스', 'layanan.service.desc': '전자제품 수리·유지보수',
      'layanan.pengiriman': '배송', 'layanan.pengiriman.desc': '인도네시아 전역 신속 배송', 'layanan.cicilan': '할부',
      'layanan.cicilan.desc': '신용카드·e월렛 0% 할부', 'section.produk': '제품', 'brand.title': '공식 브랜드', 
      'section.shopping': '지금 쇼핑', 'shopping.more': 'Shopee에서 전체 보기', 'section.review': '고객 리뷰', 
      'review.total': '총 리뷰', 'review.rating': '평균 평점', 'review.puas': '만족 고객 %', 'section.kontak': '연락처', 
      'kontak.title': '메시지 보내기 (WhatsApp/Email 선택)', 'kontak.nama': '전체 이름', 'kontak.email': '이메일', 
      'kontak.telpon': '전화/WA 번호', 'kontak.pesan': '메시지...', 'kontak.submit': '메시지 보내기', 
      'kontak.note': '공식 WhatsApp 또는 이메일로 자동 전송', 'kontak.alamat': '주소', 'kontak.telepon': '전화', 
      'kontak.whatsapp': 'WhatsApp', 'kontak.loker': '💼 채용 정보', 'kontak.follow': '팔로우:', 
      'footer.rights': '© 2026 Harris Elektronik. 모든 권리 보유', 'footer.desc': '2005년부터 신뢰받는 가전 유통사'
    },
    zh: {
      'nav.home': '首页', 'nav.banner': '横幅', 'nav.profil': '简介', 'nav.visi-misi': '愿景&使命',
      'nav.layanan': '服务', 'nav.produk': '产品', 'nav.shopping': '购物', 'nav.review': '评价', 
      'nav.kontak': '联系我们', 'hero.subtitle': '欢迎来到', 'hero.title': '哈里斯电子', 
      'hero.desc': '您值得信赖的电子产品合作伙伴', 'hero.btn': '查看我们的产品', 'section.profil': '公司简介',
      'profil.title': '关于哈里斯电子', 'read.more': '阅读更多', 'section.visi-misi': '愿景&使命', 
      'visi.title': '愿景', 'visi.desc': '完全快速满足消费者直接需求', 'misi.title': '使命', 
      'misi.desc': '提升形象价值提供分销零售服务', 'section.layanan': '我们的服务', 'layanan.penjualan': '销售', 
      'layanan.penjualan.desc': '家用电子产品完整销售', 'layanan.service': '服务', 'layanan.service.desc': '电子产品维修维护',
      'layanan.pengiriman': '配送', 'layanan.pengiriman.desc': '印尼全境快速配送', 'layanan.cicilan': '分期付款',
      'layanan.cicilan.desc': '信用卡e钱包0%分期', 'section.produk': '产品', 'brand.title': '官方品牌', 
      'section.shopping': '立即购物', 'shopping.more': '在Shopee查看全部', 'section.review': '客户评价', 
      'review.total': '总评价数', 'review.rating': '平均评分', 'review.puas': '满意客户 %', 'section.kontak': '联系我们', 
      'kontak.title': '发送消息（选择WhatsApp/Email）', 'kontak.nama': '全名', 'kontak.email': '邮箱', 
      'kontak.telpon': '电话/WA号码', 'kontak.pesan': '您的消息...', 'kontak.submit': '发送消息', 
      'kontak.note': '消息将自动发送至官方WhatsApp或邮箱', 'kontak.alamat': '地址', 'kontak.telepon': '电话', 
      'kontak.whatsapp': 'WhatsApp', 'kontak.loker': '💼 招聘信息', 'kontak.follow': '关注我们：', 
      'footer.rights': '© 2026 Harris Elektronik。保留所有权利', 'footer.desc': '自2005年起值得信赖的家用电器分销商'
    }
  };
  
  function initLang() {
    const savedLang = localStorage.getItem('lang') || 'id';
    setLanguage(savedLang);
  }
  
  function setLanguage(lang) {
    const dict = translations[lang] || {};

    // Replace BOTH text nodes and attributes for anything tagged with data-lang-key
    document.querySelectorAll('[data-lang-key]').forEach(el => {
      const key = el.getAttribute('data-lang-key');
      const value = dict[key];
      if (!value) return;

      // If element is a form/input/button/link, update relevant property.
      const tag = (el.tagName || '').toLowerCase();
      if (tag === 'input' || tag === 'textarea') {
        el.placeholder = value;
        return;
      }
      if (tag === 'button') {
        el.textContent = value;
        return;
      }
      // Link text
      if (el.hasAttribute('href') && tag === 'a') {
        el.textContent = value;
        return;
      }
      // Optional: if element holds translatable HTML (future-proof)
      if (el.hasAttribute('data-lang-html')) {
        el.innerHTML = value;
        return;
      }


      // Default: text content
      el.textContent = value;
    });

    // alt text (images)
    document.querySelectorAll('[data-lang-alt]').forEach(el => {
      const key = el.getAttribute('data-lang-alt');
      const value = dict[key];
      if (!value) return;
      el.alt = value;
    });

    // Update lang toggle
    if (langToggle) langToggle.className = `lang-toggle ${lang}`;
    localStorage.setItem('lang', lang);

    // Update html lang
    document.documentElement.lang = lang;
  }

  
  // Lang Dropdown Toggle
  function toggleLangDropdown() {
    langDropdown.classList.toggle('active');
  }

  // Lang Option Click
  function selectLanguage(lang) {
    setLanguage(lang);
    langDropdown.classList.remove('active');
    
    // Update all lang-option active states
    document.querySelectorAll('.lang-option').forEach(option => {
      option.classList.toggle('active', option.dataset.lang === lang);
    });
  }

  if (langToggle) {
    langToggle.addEventListener('click', toggleLangDropdown);
  }

  document.querySelectorAll('.lang-option').forEach(option => {
    option.addEventListener('click', () => selectLanguage(option.dataset.lang));
  });

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (!langToggle.contains(e.target) && !langDropdown.contains(e.target)) {
      langDropdown.classList.remove('active');
    }
  });

  initLang();
  
  // ==================== NAVBAR ====================
  // Hamburger Menu Toggle
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');

  function toggleNavMenu() {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
  }

  if (hamburger) {
    hamburger.addEventListener('click', toggleNavMenu);
  }

  // Close menu on nav link click (mobile)
  document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    });
  });

  // Close menu on window resize
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024) {
      hamburger.classList.remove('active');
      navMenu.classList.remove('active');
    }
  });


  // ==================== SMOOTH SCROLL ====================
  document.querySelectorAll('a[href^=\"#"]').forEach(function(anchor) {
    anchor.addEventListener('click', function (e) {
      var href = this.getAttribute('href');
      if (!href || !href.startsWith('#')) return;
      e.preventDefault();
      var target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ==================== NAVBAR BACKGROUND ====================
  window.addEventListener('scroll', function() {
    var navbar = document.querySelector('.navbar');
    if (navbar) {
      navbar.style.background = window.scrollY > 100 ? 'rgba(238, 107, 0, 0.98)' : 'rgba(238, 107, 0, 0.95)';
    }
  });

  // ==================== SCROLL ANIMATIONS ====================
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.animate-on-scroll, section').forEach(function(el) {
    observer.observe(el);
  });

  // ==================== REVIEW COUNTERS ====================
  function animateCounters() {
    document.querySelectorAll('.stat-counter').forEach(function(counter) {
      var target = parseFloat(counter.getAttribute('data-target'));
      var isDecimal = target % 1 !== 0;
      var duration = 2000;
      var start = performance.now();

      function update(now) {
        var p = Math.min((now - start) / duration, 1);
        var val = target * (1 - Math.pow(1 - p, 3));
        counter.textContent = isDecimal ? val.toFixed(1) : Math.floor(val).toLocaleString('id-ID');
        if (p < 1) requestAnimationFrame(update);
      }
      requestAnimationFrame(update);
    });
  }

  var reviewSection = document.querySelector('#review');
  if (reviewSection) {
    new IntersectionObserver(function(entries) {
      if (entries[0].isIntersecting) {
        animateCounters();
      }
    }, { threshold: 0.05 }).observe(reviewSection);
  }

  // ==================== FORM KONTAK - FUNGSI BARU ====================
  // Konstanta kontak Harris Elektronik
  const WA_NUMBER = '6281563166847'; // Format internasional tanpa +
  const EMAIL_ADDRESS = 'Mitraelectronicsperkasa@gmail.com';

  // Fungsi kirim ke WA
  window.kirimKeWA = function() {
    const nama = document.getElementById('nama').value.trim();
    const telpon = document.getElementById('telpon').value.trim();
    const email = document.getElementById('email').value.trim();
    const pesan = document.getElementById('pesan').value.trim();

    // Validasi
    if (!nama || !telpon || !pesan) {
      alert('Mohon lengkapi Nama, No. Telepon, dan Pesan!');
      return;
    }

    // Format pesan WA yang rapi
    const waMessage = `Halo Harris Elektronik!%0A%0A👤 *Nama:* ${encodeURIComponent(nama)}%0A📱 *Telepon/WA:* ${telpon}%0A📧 *Email:* ${encodeURIComponent(email)}%0A%0A💬 *Pesan:*%0A${encodeURIComponent(pesan)}%0A%0ATerima kasih! 😊`;

    const waUrl = `https://wa.me/${WA_NUMBER}?text=${waMessage}`;
    window.open(waUrl, '_blank');
    
    // Reset form setelah kirim
    document.getElementById('contactForm').reset();
    console.log('Pesan dikirim ke WA:', waUrl);
  };

  // Fungsi kirim ke Email (langsung buka Gmail)
  window.kirimKeEmail = function() {
    const nama = document.getElementById('nama').value.trim();
    const telpon = document.getElementById('telpon').value.trim();
    const email = document.getElementById('email').value.trim();
    const pesan = document.getElementById('pesan').value.trim();

    // Validasi
    if (!nama || !telpon || !email || !pesan) {
      alert('Mohon lengkapi semua field!');
      return;
    }

    // Subject & body tetap otomatis dari form
    const emailSubject = encodeURIComponent(`Pesan dari Website - ${nama}`);
    const emailBody = encodeURIComponent(
      `Halo Harris Elektronik,\n\nNama: ${nama}\nTelepon/WA: ${telpon}\nEmail: ${email}\n\nPesan:\n${pesan}\n\nTerima kasih! 😊`
    );

    // Buka Gmail composer dalam tab baru
    // Catatan: beberapa parameter Gmail memakai format "view=cm".
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(EMAIL_ADDRESS)}&su=${emailSubject}&body=${emailBody}`;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');

    // Reset form
    document.getElementById('contactForm').reset();
    console.log('Gmail dibuka:', gmailUrl);
  };

  // Form fallback (jika ada submit langsung)
  var contactForm = document.querySelector('#contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      alert('Pilih tombol WhatsApp atau Email untuk mengirim pesan!');
    });
  }

  // ==================== PARALLAX ====================
  window.addEventListener('scroll', function() {
    var scrolled = window.pageYOffset;
    document.querySelectorAll('.parallax').forEach(function(el) {
      var speed = el.getAttribute('data-speed') || 0.5;
      el.style.transform = 'translateY(' + (scrolled * speed) + 'px)';
    });
  });

  // ==================== SHOPEE CATEGORY REDIRECTION ====================
  // Semua card kategori produk: diklik (gambar & teks) -> buka Shopee search berdasarkan nama kategori
  // Tidak hardcode per-kategori (keyword diambil dari teks <span> pada card).
  (function initProdukKategoriShopeeLinks() {
    const SHOP_URL_BASE = 'https://shopee.co.id/mall/search';
    const SHOP_ID = '1141068632';

    function slugKeyword(str) {
      if (!str) return '';
      return String(str)
        .trim()
        .toLowerCase()
        // ganti '&' '/' menjadi spasi, lalu kompres spasi
        .replace(/[&/\\]+/g, ' ')
        .replace(/\s+/g, ' ')
        // encode-like cleanup to keep keyword readable
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

    function init() {
      const cards = document.querySelectorAll('.produk-category-card');
      if (!cards.length) return;

      console.log('[Shopee kategori] ditemukan:', cards.length);

      cards.forEach(function(card) { // eslint-disable-line no-unused-vars
        // Keyword dari teks <span> (yang berisi nama kategori)
        const labelEl = card.querySelector('span');
        const label = labelEl ? labelEl.textContent : (card.dataset && card.dataset.category ? card.dataset.category : '');

        const url = buildShopeeUrl(label);

        // Update href agar seluruh card clickable (a sudah membungkus gambar & teks)
        // Jika label kosong, fallback ke dataset.category supaya tidak mengarah ke URL kosong.
        const finalKeyword = label || (card.dataset && card.dataset.category ? card.dataset.category : '');
        const finalUrl = buildShopeeUrl(finalKeyword);
        card.setAttribute('href', finalUrl);

        // Pastikan behavior tab baru sudah ada; tetap enforce biar konsisten
        card.setAttribute('target', '_blank');
        card.setAttribute('rel', 'noopener noreferrer');

        // Aksesibilitas: pastikan ada role/focus-visible sesuai kebutuhan (opsional)
        card.setAttribute('aria-label', `Cari di Shopee: ${label}`);
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', init);
    } else {
      init();
    }
  })();

  // ==================== HOVER EFFECTS ====================

  document.querySelectorAll('.product-card, .card, .btn, .kirim-btn').forEach(function(el) {
    el.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px) scale(1.02)';
    });
    el.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });

  
  (function initBrandMarqueeInfinite() {
    const brandTrack = document.querySelector('.brand-track');
    const brandMarquee = document.querySelector('.brand-marquee');
    if (!brandTrack || !brandMarquee) return;

    // Get original logos (18 brands)
    const originalLogos = Array.from(brandTrack.querySelectorAll('a.brand-logo'));
    if (originalLogos.length === 0) return;

    const originalCount = originalLogos.length;
    console.log('[Brand Marquee Fix] Found ' + originalCount + ' original logos');

    // STEP 1: Clone logos untuk seamless infinite loop
    // Clone 3x untuk smooth loop effect (bahkan jika user scroll sangat cepat)
    for (let i = 0; i < 3; i++) {
      originalLogos.forEach(logo => {
        const clone = logo.cloneNode(true);
        brandTrack.appendChild(clone);
      });
    }

    const totalLogos = brandTrack.querySelectorAll('a.brand-logo').length;
    console.log('[Brand Marquee Fix] After cloning: ' + totalLogos + ' total logos');

    // STEP 2: Ensure all links are properly clickable
    // Browser native click behavior adalah yang terbaik
    brandTrack.querySelectorAll('a.brand-logo').forEach(function(link, index) {
      // Add data-index untuk debugging
      link.setAttribute('data-logo-index', index % originalCount);
      
      // Add tabindex untuk keyboard accessibility
      if (!link.hasAttribute('tabindex')) {
        link.setAttribute('tabindex', '0');
      }

      // Keyboard support
      link.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });

      // Visual feedback on focus
      link.addEventListener('focus', function() {
        this.style.outline = '2px solid #ff7300';
        this.style.outlineOffset = '4px';
      });

      link.addEventListener('blur', function() {
        this.style.outline = 'none';
      });
    });

    // STEP 3: Dynamic animation timing berdasarkan jumlah elemen
    // Ini lebih robust daripada hardcoded timing
    const gapSize = 3; // rem, dari CSS
    const gapSizePx = gapSize * 16; // convert to px
    const logoWidthEst = 100; // px, dari CSS min-width
    const totalWidthEst = (originalCount * (logoWidthEst + gapSizePx)) + gapSizePx;
    const animationDuration = Math.max(40, (totalWidthEst / 50)); // 40s minimum, scale dengan width
    
    console.log('[Brand Marquee Fix] Animation duration: ' + animationDuration.toFixed(1) + 's');

    // STEP 4: Reset animation setiap saat untuk ensure loop consistency
    // Tidak benar-benar reset visual, hanya memastikan timing tetap konsisten
    
    // Optional: Add click tracking untuk debugging (comment if not needed)
    brandTrack.addEventListener('click', function(e) {
      if (e.target.tagName === 'A' && e.target.classList.contains('brand-logo')) {
        const href = e.target.getAttribute('href');
        const label = e.target.getAttribute('aria-label');
        console.log('[Brand Click] ' + label + ' → ' + href);
      }
    });

    console.log('[Brand Marquee Fix] ✅ Initialization complete - Click detection ACCURATE');
  })();



  // ==================== PARTICLES ====================
  var hero = document.querySelector('.hero');
  if (hero) {
    for (var i = 0; i < 50; i++) {
      var particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.cssText = 'position:absolute;width:' + (Math.random() * 4 + 2) + 'px;height:' + (Math.random() * 4 + 2) + 'px;background:rgba(255,255,255,0.5);border-radius:50%;left:' + Math.random() * 100 + '%;top:' + Math.random() * 100 + '%;animation:' + (Math.random() * 20 + 20) + 's linear infinite';
      hero.appendChild(particle);
    }
  }

  // ==================== SCROLL TO TOP ====================
  var scrollBtn = document.createElement('button');
  scrollBtn.innerHTML = '↑';
  scrollBtn.className = 'scroll-to-top';
  scrollBtn.style.cssText = 'position:fixed;bottom:30px;right:30px;width:50px;height:50px;border:none;border-radius:50%;background:#ff7300;color:white;font-size:1.5rem;cursor:pointer;opacity:0;transform:scale(0);transition:all 0.3s ease;z-index:1000;box-shadow:0 4px 12px rgba(0,0,0,0.3);';
  document.body.appendChild(scrollBtn);

  scrollBtn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', function() {
    var shown = window.scrollY > 500;
    scrollBtn.style.opacity = shown ? '1' : '0';
    scrollBtn.style.transform = shown ? 'scale(1)' : 'scale(0)';
  });

  // ==================== IMAGE MODAL PREVIEW ====================
  (function initImageModal() {
    // Create modal HTML
    const modalHTML = `
      <div id="imageModal" class="image-modal">
        <span class="close-modal">&times;</span>
        <div class="modal-content">
          <img id="modalImage" src="" alt="Preview">
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const closeBtn = document.querySelector('.close-modal');

    // Add click event to profil image
    const profilImage = document.getElementById('profil-image');
    if (profilImage) {
      profilImage.addEventListener('click', function(e) {
        e.preventDefault();
        modalImg.src = this.src;
        modal.classList.add('show');
        document.body.style.overflow = 'hidden'; // Prevent background scroll
      });
    }

    // Close modal events
    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', function(e) {
      if (e.target === modal) {
        closeModal();
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && modal.classList.contains('show')) {
        closeModal();
      }
    });

    function closeModal() {
      modal.classList.remove('show');
      document.body.style.overflow = ''; // Restore scroll
    }
  })();

  console.log('=== HARRIS ELEKTRONIK SIAP - FORM KONTAK BERFUNGSI ===');
});
