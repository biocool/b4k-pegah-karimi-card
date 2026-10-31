const profile = {
  displayName: "Dr. Pegah Karimi",
  firstName: "Pegah",
  lastName: "Karimi",
  organization: "Bricks 4 Kidz — Los Angeles Valley",
  phoneDisplay: "818-461-4147",
  phoneRaw: "+18184614147",
  email: "pegah.b4k@gmail.com",
  website: "https://bricks4kidz.us/california-losangelesvalley/",
  instagram: "https://www.instagram.com/bricks4kidzlavalley/",
  address: "860 Hillview Ct, Suite 310, Milpitas, CA 95035",
  cardUrl: "https://biocool.github.io/b4k-pegah-karimi-card/",
};

const toast = document.querySelector("#toast");
const modal = document.querySelector("#qr-modal");
const qrImage = document.querySelector("#qr-image");
const qrLoader = document.querySelector("#qr-loader");
let toastTimer;
let currentCardUrl = "";
let deferredInstallPrompt;

function showToast(message) {
  window.clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add("is-visible");
  toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
}

function getCardUrl() {
  return profile.cardUrl;
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

document.querySelector("#save-contact").addEventListener("click", () => {
  const vcard = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${profile.displayName}`,
    `N:${profile.lastName};${profile.firstName};;Dr.;`,
    `ORG:${profile.organization}`,
    `TEL;TYPE=CELL:${profile.phoneRaw}`,
    `EMAIL;TYPE=INTERNET:${profile.email}`,
    `URL:${profile.website}`,
    `ADR;TYPE=WORK:;;860 Hillview Ct\, Suite 310;Milpitas;CA;95035;USA`,
    `X-SOCIALPROFILE;TYPE=instagram:${profile.instagram}`,
    "END:VCARD",
  ].join("\r\n");

  downloadBlob(new Blob([vcard], { type: "text/vcard;charset=utf-8" }), "Dr-Pegah-Karimi.vcf");
  showToast("Contact downloaded");
});

document.querySelector("#share-card").addEventListener("click", async () => {
  const shareData = {
    title: "Dr. Pegah Karimi — Bricks 4 Kidz",
    text: "We Learn. We Build. We Play.",
    url: getCardUrl(),
  };

  if (navigator.share) {
    try {
      await navigator.share(shareData);
      return;
    } catch (error) {
      if (error.name === "AbortError") return;
    }
  }

  try {
    await navigator.clipboard.writeText(shareData.url);
    showToast("Card link copied");
  } catch {
    openQr();
    showToast("Copy the card link below the QR code");
  }
});

function openQr() {
  currentCardUrl = getCardUrl();
  qrLoader.hidden = false;
  qrImage.removeAttribute("src");
  qrImage.onload = () => { qrLoader.hidden = true; };
  qrImage.onerror = () => {
    qrLoader.hidden = false;
    qrLoader.textContent = "QR is unavailable";
  };
  modal.hidden = false;
  document.body.style.overflow = "hidden";
  qrImage.src = "assets/card-qr.png";
}

function closeQr() {
  modal.hidden = true;
  document.body.style.overflow = "";
}

document.querySelector("#show-qr").addEventListener("click", openQr);
document.querySelector("#close-qr").addEventListener("click", closeQr);
document.querySelector(".modal-backdrop").addEventListener("click", closeQr);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modal.hidden) closeQr();
});

document.querySelector("#copy-url").addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(currentCardUrl || getCardUrl());
    showToast("Card link copied");
  } catch {
    showToast("Copying is unavailable in this browser");
  }
});

document.querySelector("#download-qr").addEventListener("click", async () => {
  try {
    const response = await fetch("assets/dr-pegah-karimi-phone-card.png");
    if (!response.ok) throw new Error("Phone card download failed");
    const blob = await response.blob();
    const filename = "Dr-Pegah-Karimi-B4K-Phone-Card.png";
    const file = typeof File === "undefined"
      ? null
      : new File([blob], filename, { type: "image/png" });

    if (file && navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "Dr. Pegah Karimi — B4K QR Card",
          text: "Save this QR card to Photos for quick sharing.",
        });
        return;
      } catch (error) {
        if (error.name === "AbortError") return;
      }
    }

    downloadBlob(blob, filename);
    showToast("Phone card downloaded");
  } catch {
    showToast("Phone card download is unavailable in this browser");
  }
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  document.querySelector("#install-help").textContent = "Tap Add to Home Screen for one-tap access.";
});

document.querySelector("#install-app").addEventListener("click", async () => {
  if (deferredInstallPrompt) {
    deferredInstallPrompt.prompt();
    const result = await deferredInstallPrompt.userChoice;
    if (result.outcome === "accepted") showToast("Card added to your device");
    deferredInstallPrompt = null;
    return;
  }
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  document.querySelector("#install-steps").innerHTML = isIOS
    ? "<li>Tap the browser <strong>Share</strong> button.</li><li>Choose <strong>Add to Home Screen</strong>.</li><li>Tap <strong>Add</strong>.</li>"
    : "<li>Open the browser menu.</li><li>Choose <strong>Install app</strong> or <strong>Add to Home screen</strong>.</li><li>Confirm the installation.</li>";
  document.querySelector("#install-modal").hidden = false;
  document.body.style.overflow = "hidden";
});

function closeInstallGuide() {
  document.querySelector("#install-modal").hidden = true;
  document.body.style.overflow = "";
}

document.querySelector(".install-close").addEventListener("click", closeInstallGuide);
document.querySelector(".install-backdrop").addEventListener("click", closeInstallGuide);
document.querySelector(".install-done").addEventListener("click", closeInstallGuide);

window.addEventListener("appinstalled", () => showToast("Bricks 4 Kidz card installed"));

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js"));
}
