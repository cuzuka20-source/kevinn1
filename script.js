// ============================
// MÀN HÌNH NHẬP MẬT KHẨU
// ============================
(function () {
  const MAT_KHAU_DUNG = 'kuiutuyen28';
  const man_hinh = document.getElementById('mat-khau-man-hinh');
  const input = document.getElementById('mat-khau-input');
  const nut = document.getElementById('mat-khau-nut');
  const loi = document.getElementById('mat-khau-loi');

  if (!man_hinh) return;

  if (localStorage.getItem('da-nhap-dung') === 'true') {
    man_hinh.classList.add('da-mo');
  }

  function thuMoKhoa() {
    if (input.value === MAT_KHAU_DUNG) {
      localStorage.setItem('da-nhap-dung', 'true');
      man_hinh.classList.add('da-mo');
      loi.textContent = '';
    } else {
      loi.textContent = 'Sai mật khẩu rồi, thử lại nhé';
      input.value = '';
    }
  }

  nut.addEventListener('click', thuMoKhoa);
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') thuMoKhoa();
  });
})();
// ============================
// PHẦN 1: MỞ ĐẦU (chuông gió) - xếp theo hình chữ nhật thật, không chồng đè
// ============================

function doTachAnh(a, b) {
  return Math.max(
    Math.abs(a.x - b.x) / ((a.w + b.w) / 2),
    Math.abs(a.y - b.y) / ((a.h + b.h) / 2)
  );
}

function timViTriKhongDe(dsKichThuoc, W, H, vungCamGiua) {
  const SO_UNG_VIEN = 150;
  const LE = 10;
  const tam = { x: W / 2, y: H / 2, w: vungCamGiua.w, h: vungCamGiua.h };

  const thuTu = dsKichThuoc
    .map((_, i) => i)
    .sort((i, j) => dsKichThuoc[j].w * dsKichThuoc[j].h - dsKichThuoc[i].w * dsKichThuoc[i].h);

  const daDat = [];
  const viTri = new Array(dsKichThuoc.length);

  for (const i of thuTu) {
    const w = dsKichThuoc[i].w;
    const h = dsKichThuoc[i].h;
    const xMin = w / 2 + LE;
    const xMax = W - w / 2 - LE;
    const yMin = h / 2 + LE;
    const yMax = H - h / 2 - LE;
    if (xMax < xMin || yMax < yMin) return { dat: false, viTri: [] };

    let tot = null;
    let diemTot = -Infinity;
    for (let k = 0; k < SO_UNG_VIEN; k++) {
      const c = {
        x: xMin + Math.random() * (xMax - xMin),
        y: yMin + Math.random() * (yMax - yMin),
        w: w,
        h: h
      };
      let diem = doTachAnh(c, tam);
      for (const d of daDat) {
        const t = doTachAnh(c, d);
        if (t < diem) diem = t;
      }
      if (diem > diemTot) {
        diemTot = diem;
        tot = c;
      }
    }
    daDat.push(tot);
    viTri[i] = tot;
  }

  let dat = true;
  for (let i = 0; i < daDat.length; i++) {
    if (doTachAnh(daDat[i], tam) < 1) dat = false;
    for (let j = i + 1; j < daDat.length; j++) {
      if (doTachAnh(daDat[i], daDat[j]) < 1) dat = false;
    }
  }
  return { dat: dat, viTri: viTri.map((v) => ({ x: v.x, y: v.y })) };
}

function xepAnhKhongDe(khung) {
  const cacAnh = khung.querySelectorAll('.chuong-gio-item');
  if (cacAnh.length === 0) return;

  const W = khung.clientWidth;
  let H = khung.clientHeight || window.innerHeight;

  const dsKichThuoc = Array.from(cacAnh).map((anh) => ({
    w: anh.offsetWidth,
    h: anh.offsetHeight
  }));

  const vungCamGiua = { w: 200, h: 200 };

  let ketQua = { dat: false, viTri: [] };
  for (let lan = 0; lan < 20; lan++) {
    ketQua = timViTriKhongDe(dsKichThuoc, W, H, vungCamGiua);
    if (ketQua.dat) break;
    H = Math.round(H * 1.1);
  }

  khung.style.minHeight = `${H}px`;

  cacAnh.forEach((anh, index) => {
    const goc = (Math.random() - 0.5) * 20;
    const vt = ketQua.viTri[index];
    anh.style.position = 'absolute';
    anh.style.left = `${vt.x}px`;
    anh.style.top = `${vt.y}px`;
    anh.style.transform = `translate(-50%, -50%) rotate(${goc}deg)`;
  });
}

document.querySelectorAll('.chuong-gio').forEach(xepAnhKhongDe);

// ============================
// TRÁI TIM HẠT SÁNG (thay quả cầu cũ) - đã tối ưu hiệu năng
// ============================

function khoiTaoTymHat(canvas) {
  const ctx = canvas.getContext('2d');
  const dpr = window.devicePixelRatio || 1;
  const kichThuocHienThi = canvas.clientWidth || 260;

  canvas.width = kichThuocHienThi * dpr;
  canvas.height = kichThuocHienThi * dpr;
  ctx.scale(dpr, dpr);

  const tam = kichThuocHienThi / 2;
  const scale = kichThuocHienThi / 2.6;

  function duongCongTym(t) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
    return { x: x / 16, y: -y / 16 };
  }

  const SO_VIEN = 70;
  const hatVien = [];
  for (let i = 0; i < SO_VIEN; i++) {
    const t = (i / SO_VIEN) * Math.PI * 2;
    const p = duongCongTym(t);
    const eps = 0.01;
    const p2 = duongCongTym(t + eps);
    const dx = p2.x - p.x, dy = p2.y - p.y;
    const dl = Math.hypot(dx, dy) || 1;
    const nx = -dy / dl, ny = dx / dl;
    const jitter = (Math.random() - 0.5) * 0.05;

    hatVien.push({
      x: tam + (p.x + nx * jitter) * scale,
      y: tam + (p.y + ny * jitter) * scale,
      pha: Math.random() * Math.PI * 2
    });
  }

  function fTym(x, y) {
    return Math.pow(x * x + y * y - 1, 3) - x * x * Math.pow(y, 3);
  }
  const X_MIN = -1.15, X_MAX = 1.15, Y_MIN = -1.0, Y_MAX = 1.25;

  const hatDay = [];
  for (let dem = 0; hatDay.length < 170 && dem < 50000; dem++) {
    const x = X_MIN + Math.random() * (X_MAX - X_MIN);
    const y = Y_MIN + Math.random() * (Y_MAX - Y_MIN);
    if (fTym(x, y) < -0.02) {
      hatDay.push({ x: tam + x * scale, y: tam + y * scale, pha: Math.random() * Math.PI * 2 });
    }
  }

  const canhVien = [];
  for (let i = 0; i < hatVien.length; i++) {
    canhVien.push({ a: hatVien[i], b: hatVien[(i + 1) % hatVien.length] });
  }

  const tatCaHat = hatVien.concat(hatDay);
  const NGUONG_DAY = kichThuocHienThi * 0.1;
  const canhDay = [];
  for (let i = 0; i < tatCaHat.length; i++) {
    for (let j = i + 1; j < tatCaHat.length; j++) {
      const a = tatCaHat[i], b = tatCaHat[j];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < NGUONG_DAY) canhDay.push({ a, b, doMo: 1 - d / NGUONG_DAY });
    }
  }

  const lopNen = document.createElement('canvas');
  lopNen.width = canvas.width;
  lopNen.height = canvas.height;
  const ctxNen = lopNen.getContext('2d');
  ctxNen.scale(dpr, dpr);

  canhDay.forEach(({ a, b, doMo }) => {
    ctxNen.strokeStyle = `rgba(220, 220, 230, ${doMo * 0.3})`;
    ctxNen.lineWidth = 1;
    ctxNen.beginPath();
    ctxNen.moveTo(a.x, a.y);
    ctxNen.lineTo(b.x, b.y);
    ctxNen.stroke();
  });

  canhVien.forEach(({ a, b }) => {
    ctxNen.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctxNen.lineWidth = 1.5;
    ctxNen.beginPath();
    ctxNen.moveTo(a.x, a.y);
    ctxNen.lineTo(b.x, b.y);
    ctxNen.stroke();
  });

  function taoDomSang(banKinh) {
    const kt = banKinh * 6;
    const c = document.createElement('canvas');
    c.width = kt; c.height = kt;
    const sctx = c.getContext('2d');
    const t = kt / 2;
    const grad = sctx.createRadialGradient(t, t, 0, t, t, t);
    grad.addColorStop(0, 'rgba(255,255,255,1)');
    grad.addColorStop(0.3, 'rgba(255,255,255,0.8)');
    grad.addColorStop(1, 'rgba(255,255,255,0)');
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, kt, kt);
    return c;
  }
  const domSangVien = taoDomSang(3);
  const domSangDay = taoDomSang(2);

  function ve(thoiGian) {
    ctx.clearRect(0, 0, kichThuocHienThi, kichThuocHienThi);
    ctx.drawImage(lopNen, 0, 0, kichThuocHienThi, kichThuocHienThi);

    tatCaHat.forEach((hat, index) => {
      const nhapNhay = 0.6 + 0.4 * Math.sin(thoiGian / 900 + hat.pha);
      const laVien = index < hatVien.length;
      const sprite = laVien ? domSangVien : domSangDay;
      const doSang = laVien ? 1 : 0.7;
      const nua = sprite.width / 2;

      ctx.globalAlpha = nhapNhay * doSang;
      ctx.drawImage(sprite, hat.x - nua, hat.y - nua);
    });
    ctx.globalAlpha = 1;

    requestAnimationFrame(ve);
  }

  requestAnimationFrame(ve);
}

const tymCanvas = document.getElementById('tym-canvas');
if (tymCanvas) khoiTaoTymHat(tymCanvas);

// Hiện ảnh lần lượt khi cuộn tới, rồi mới tới dòng chữ
document.querySelectorAll('.chuong-gio').forEach((khung) => {
  const cacAnh = khung.querySelectorAll('.chuong-gio-item');
  const dongChu = khung.querySelector('.chu-hien-ra');
  let daChay = false;

  const quanSat = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !daChay) {
        daChay = true;
        chayHieuUngChuongGio(cacAnh, dongChu);
      }
    });
  }, { threshold: 0.3 });

  quanSat.observe(khung);
});

function chayHieuUngChuongGio(cacAnh, dongChu) {
  const khoangCach = 500;

  cacAnh.forEach((anh, index) => {
    setTimeout(() => {
      anh.classList.add('hien');
    }, index * khoangCach);
  });

  const thoiGianChoChu = cacAnh.length * khoangCach;
  setTimeout(() => {
    if (dongChu) dongChu.classList.add('hien');
  }, thoiGianChoChu);
}

// ============================
// PHẦN 2: 4 NĂM (cửa sổ xem video)
// ============================

const cacThumb = document.querySelectorAll('.nam-thumb');
const modal = document.getElementById('nam-modal');
const modalVideo = document.getElementById('nam-modal-video');
const modalMota = document.getElementById('nam-modal-mota');
const nutDong = document.getElementById('nam-dong');

function dongCuaSoNam() {
  modal.classList.remove('mo');
  modalVideo.pause();
  modalVideo.currentTime = 0;
  modalMota.classList.remove('hien');
}

cacThumb.forEach((thumb) => {
  thumb.addEventListener('click', () => {
    cacThumb.forEach((t) => t.classList.remove('dang-chon'));
    thumb.classList.add('dang-chon');

    modalVideo.src = thumb.dataset.video;
    modalMota.textContent = thumb.dataset.mota;
    modalMota.classList.remove('hien');
    modal.classList.add('mo');
  });
});

modalVideo.addEventListener('ended', () => {
  modalMota.classList.add('hien');
});

nutDong.addEventListener('click', dongCuaSoNam);

modal.addEventListener('click', (event) => {
  if (event.target === modal) {
    dongCuaSoNam();
  }
});

// ============================
// 2 HÒM THƯ (Quà Bí Mật + Điều muốn nói nhất)
// ============================

document.getElementById('hom-qua-bi-mat').addEventListener('click', () => {
  document.getElementById('modal-qua-bi-mat').classList.add('mo');
});

document.getElementById('hom-dieu-muon-noi').addEventListener('click', () => {
  document.getElementById('modal-dieu-muon-noi').classList.add('mo');
});

document.querySelectorAll('.hom-thu-modal').forEach((modalEl) => {
  const nutDongRieng = modalEl.querySelector('.hom-thu-dong');
  if (nutDongRieng) {
    nutDongRieng.addEventListener('click', () => {
      modalEl.classList.remove('mo');
    });
  }
  modalEl.addEventListener('click', (event) => {
    if (event.target === modalEl) {
      modalEl.classList.remove('mo');
    }
  });
});

document.getElementById('dieu-muon-noi-gui').addEventListener('click', () => {
  const noiDung = document.getElementById('dieu-muon-noi-noidung').value.trim();
  if (!noiDung) {
    alert('Bạn chưa viết gì cả, hãy nhập điều bạn muốn nói trước khi gửi nhé.');
    return;
  }
  const email = 'DIA_CHI_EMAIL_CUA_BAN@gmail.com';
  const tieuDe = encodeURIComponent('Điều muốn nói nhất từ trang kỷ niệm');
  const noiDungMaHoa = encodeURIComponent(noiDung);
  window.location.href = `mailto:${email}?subject=${tieuDe}&body=${noiDungMaHoa}`;
});

// ============================
// PHẦN 3: KẾT THÚC (tường ảnh)
// ============================

function raiAnhTuongAnh(khung) {
  const cacAnh = khung.querySelectorAll('.tuong-anh-anh');
  const soAnh = cacAnh.length;

  if (soAnh === 0) {
    console.warn('Không tìm thấy ảnh .tuong-anh-anh nào trong #ket-thuc');
    return;
  }

  const chieuRong = khung.clientWidth;
  const chieuCao = khung.clientHeight;

  const tiLeKhung = chieuRong / chieuCao;
  const soCot = Math.max(1, Math.ceil(Math.sqrt(soAnh * tiLeKhung)));
  const soHang = Math.max(1, Math.ceil(soAnh / soCot));

  const rongO = chieuRong / soCot;
  const caoO = chieuCao / soHang;

  const kichThuocAnh = Math.min(rongO, caoO) * 0.9;

  cacAnh.forEach((anh, index) => {
    const cot = index % soCot;
    const hang = Math.floor(index / soCot);

    const jitterX = (Math.random() - 0.5) * rongO * 0.3;
    const jitterY = (Math.random() - 0.5) * caoO * 0.3;

    const x = cot * rongO + rongO / 2 + jitterX;
    const y = hang * caoO + caoO / 2 + jitterY;

    const gocXoay = (Math.random() - 0.5) * 16;

    anh.style.width = `${kichThuocAnh}px`;
    anh.style.height = `${kichThuocAnh}px`;
    anh.style.left = `${x}px`;
    anh.style.top = `${y}px`;
    anh.style.transform = `translate(-50%, -50%) rotate(${gocXoay}deg)`;
  });
}

const khungKetThuc = document.getElementById('ket-thuc');
if (khungKetThuc) {
  raiAnhTuongAnh(khungKetThuc);

  const cacAnhKetThuc = khungKetThuc.querySelectorAll('.tuong-anh-anh');
  const doanVan = khungKetThuc.querySelector('.doan-van');
  let daChayKetThuc = false;

  const quanSatKetThuc = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting && !daChayKetThuc) {
        daChayKetThuc = true;

        cacAnhKetThuc.forEach((anh, index) => {
          setTimeout(() => {
            anh.classList.add('hien');
          }, index * 150);
        });

        const thoiGianChoDoanVan = cacAnhKetThuc.length * 150 * 0.6;
        setTimeout(() => {
          if (doanVan) doanVan.classList.add('hien');
        }, thoiGianChoDoanVan);
      }
    });
  }, { threshold: 0.2 });

  quanSatKetThuc.observe(khungKetThuc);
}
