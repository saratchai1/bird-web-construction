import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, orderBy, serverTimestamp, where, onSnapshot } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-storage.js";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAihujoSJ6ISXQRBF--aGjHVprxOdSH430",
  authDomain: "web-bird-krabi.firebaseapp.com",
  projectId: "web-bird-krabi",
  storageBucket: "web-bird-krabi.firebasestorage.app",
  messagingSenderId: "496431118372",
  appId: "1:496431118372:web:8cebf30715c2eca36940b1",
  measurementId: "G-XR2LQ3MVDK"
};

// Initialize Firebase (wrapped in try-catch in case config is empty)
let db;
let storage;
try {
    const app = initializeApp(firebaseConfig);
    db = getFirestore(app);
    storage = getStorage(app);
} catch (e) {
    console.log("Firebase not initialized yet. Waiting for config.");
}

// Data for birds (Assuming we want to filter them later)
const birds = [
    { id: 1, name: "นกแต้วแล้วท้องดำ", habitat: "ป่าดิบชื้นที่ราบต่ำ" },
    { id: 2, name: "นกเงือกดำ", habitat: "ป่าดิบชื้นที่ราบต่ำ" },
    { id: 3, name: "นกกระเต็นใหญ่ปีกสีน้ำตาล", habitat: "ป่าชายเลน" },
    // ... we don't need full data logic if we just use visual CSS filtering
];

// Initialize Floating Birds
function initFloatingBirds() {
    const container = document.getElementById('floatingBirds');
    if (!container) return;
    const birdImages = ['assets/bird1.png', 'assets/bird2.png', 'assets/bird3.png', 'assets/bird4.png'];
    const maxBirds = 8;

    for (let i = 0; i < maxBirds; i++) {
        createBird(container, birdImages);
    }
}

function createBird(container, images) {
    const bird = document.createElement('img');
    bird.src = images[Math.floor(Math.random() * images.length)];
    bird.classList.add('floating-bird');
    
    // Randomize position, size, and animation delay
    const startX = Math.random() * 100;
    const delay = Math.random() * 15;
    const duration = 15 + Math.random() * 10;
    const size = 0.5 + Math.random() * 0.5;

    bird.style.left = `${startX}vw`;
    bird.style.animationDelay = `${delay}s`;
    bird.style.animationDuration = `${duration}s`;
    bird.style.transform = `scale(${size})`;

    container.appendChild(bird);

    // Recreate bird when animation ends
    bird.addEventListener('animationiteration', () => {
        bird.style.left = `${Math.random() * 100}vw`;
    });
}

// Parallax Effect on Mouse Move
function initParallax() {
    document.addEventListener('mousemove', (e) => {
        const x = (window.innerWidth - e.pageX * 2) / 90;
        const y = (window.innerHeight - e.pageY * 2) / 90;
        
        const bg = document.querySelector('.global-video-bg-container');
        if(bg) {
            bg.style.transform = `scale(1.05) translate(${x}px, ${y}px)`;
        }
    });
}

// Simple Filter Interaction
function initFilters() {
    const buttons = document.querySelectorAll('.filter-btn');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            buttons.forEach(b => b.classList.remove('active'));
            // Add to clicked
            btn.classList.add('active');
            
            // Trigger line animation re-draw
            const lines = document.querySelectorAll('.line-path');
            lines.forEach(line => {
                line.classList.remove('active');
                void line.offsetWidth; // trigger reflow
                line.classList.add('active');
            });
        });
    });
}

// Setup SVG Paths
function initPaths() {
    const lines = document.querySelectorAll('.line-path');
    lines.forEach((line, index) => {
        // Stagger the animation
        setTimeout(() => {
            line.classList.add('active');
        }, index * 500);
    });
}

// Setup Bird Card Lightbox
function initBirdLightbox() {
    const birdCards = document.querySelectorAll('.bird-card');
    birdCards.forEach(card => {
        card.addEventListener('click', () => {
            const img = card.querySelector('img');
            const h3 = card.querySelector('h3');
            const p = card.querySelector('p');
            
            if (img) {
                const src = img.getAttribute('src');
                const caption = (h3 ? h3.textContent : '') + (p ? ' (' + p.textContent + ')' : '');
                openLightbox(src, caption);
            }
        });
    });
}

// ==========================================
// NEW LOGIC FOR APPENDED SECTIONS (2 & 3)
// ==========================================

// Scroll to Section
function scrollToNextSection() {
    const nextSection = document.getElementById('new-content-wrapper');
    if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth' });
    }
}



// Gallery Tabs Switching
function initGalleryTabs() {
    const tabBtns = document.querySelectorAll('.new-gallery-tab-btn');
    const tabPanes = document.querySelectorAll('.new-gallery-tab-pane');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');

            // Remove active from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));

            // Add active to clicked
            btn.classList.add('active');
            const targetPane = document.getElementById(targetId);
            if (targetPane) targetPane.classList.add('active');
        });
    });
}

// Lightbox functionality
function openLightbox(imageSrc, caption) {
    const modal = document.getElementById('newLightboxModal');
    const modalImg = document.getElementById('newLightboxImg');
    const modalCaption = document.getElementById('newLightboxCaption');
    const birdCommentsSection = document.getElementById('birdCommentsSection');
    
    if (modal && modalImg) {
        modalImg.src = imageSrc;
        if (modalCaption) modalCaption.textContent = caption;
        
        // Check if it's a bird image (from assets/bird)
        if (imageSrc.includes('assets/bird')) {
            birdCommentsSection.style.display = 'block';
            const birdName = caption.split(' (')[0]; // Extract Thai name
            document.getElementById('currentBirdName').value = birdName;
            loadBirdComments(birdName);
        } else {
            birdCommentsSection.style.display = 'none';
        }

        modal.classList.add('active');
        document.body.style.overflow = 'hidden'; // prevent background scrolling
    }
}

function closeLightbox(e) {
    // Only close if clicking outside image or on close button
    if (e.target.id === 'newLightboxModal' || e.target.classList.contains('new-lightbox-close')) {
        const modal = document.getElementById('newLightboxModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto'; // restore scrolling
        }
    }
}


// Run on load
window.addEventListener('DOMContentLoaded', () => {
    initFloatingBirds();
    initParallax();
    initFilters();
    initPaths();
    initBirdLightbox();
    
    initGalleryTabs();
    
    // Load public complaints
    loadComplaints();
});

// ==========================================
// FIREBASE COMMENT SYSTEM LOGIC
// ==========================================

// Helper function to format date
function formatDate(timestamp) {
    if (!timestamp) return 'เมื่อสักครู่';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('th-TH', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute:'2-digit'
    });
}

// 1. Bird Comments Logic
async function loadBirdComments(birdName) {
    const list = document.getElementById('birdCommentsList');
    if (!db) {
        list.innerHTML = '<div class="loading-text">ระบบคอมเมนต์ยังไม่ได้เชื่อมต่อฐานข้อมูล</div>';
        return;
    }
    
    list.innerHTML = '<div class="loading-text">กำลังโหลดข้อมูล...</div>';
    
    try {
        const q = query(collection(db, "birdSightings"), where("bird", "==", birdName), orderBy("timestamp", "desc"));
        
        // Using onSnapshot for realtime updates (optional, but good for comments)
        // For simplicity here, we just fetch once, but onSnapshot is better
        getDocs(q).then((querySnapshot) => {
            if (querySnapshot.empty) {
                list.innerHTML = '<div class="loading-text">ยังไม่มีรายงานการพบเห็นนกชนิดนี้ เป็นคนแรกที่รายงานสิ!</div>';
                return;
            }
            
            let html = '';
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                let imageHtml = data.imageUrl ? `<img src="${data.imageUrl}" class="comment-attached-image" alt="ภาพแนบจากประชาชน">` : '';
                html += `
                    <div class="comment-item">
                        <div class="comment-header">
                            <span class="comment-author">${data.name || 'ผู้ไม่ประสงค์ออกนาม'}</span>
                            <span class="comment-date">${formatDate(data.timestamp)}</span>
                        </div>
                        <div class="comment-body">
                            ${data.text}
                            ${imageHtml}
                        </div>
                    </div>
                `;
            });
            list.innerHTML = html;
        });
    } catch (error) {
        console.error("Error loading bird comments: ", error);
        list.innerHTML = '<div class="loading-text" style="color:red;">เกิดข้อผิดพลาดในการโหลดข้อมูล (กรุณาตั้งค่า Firebase Index)</div>';
    }
}

// Image compression helper
async function compressImage(file, maxWidth = 1200, maxHeight = 1200, quality = 0.7) {
    return new Promise((resolve) => {
        // Only compress images
        if (!file.type.match(/image.*/)) {
            resolve(file);
            return;
        }

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > maxWidth) {
                        height = Math.round(height * (maxWidth / width));
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = Math.round(width * (maxHeight / height));
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob((blob) => {
                    if (blob) {
                        const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(newFile);
                    } else {
                        resolve(file); // Fallback
                    }
                }, 'image/jpeg', quality);
            };
            img.onerror = () => resolve(file); // Fallback
        };
        reader.onerror = () => resolve(file); // Fallback
    });
}

async function uploadImageAndGetUrl(file, folder) {
    if (!storage || !file) return null;
    
    // Compress the image before uploading
    const compressedFile = await compressImage(file);
    
    const filename = `${Date.now()}_${compressedFile.name}`;
    const storageRef = ref(storage, `${folder}/${filename}`);
    await uploadBytes(storageRef, compressedFile);
    return await getDownloadURL(storageRef);
}

document.getElementById('birdCommentForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!db) return alert("Firebase is not initialized.");
    
    const birdName = document.getElementById('currentBirdName').value;
    const name = document.getElementById('birdCommenterName').value;
    const text = document.getElementById('birdCommentText').value;
    const imageFile = document.getElementById('birdCommentImage').files[0];
    const btn = e.target.querySelector('button');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังส่ง...';
    btn.disabled = true;
    
    try {
        let imageUrl = null;
        if (imageFile) {
            imageUrl = await uploadImageAndGetUrl(imageFile, 'bird_sightings');
        }

        await addDoc(collection(db, "birdSightings"), {
            bird: birdName,
            name: name,
            text: text,
            imageUrl: imageUrl,
            timestamp: serverTimestamp()
        });
        document.getElementById('birdCommentText').value = '';
        document.getElementById('birdCommentImage').value = '';
        loadBirdComments(birdName); // Reload comments
    } catch (e) {
        console.error("Error adding document: ", e);
        alert("เกิดข้อผิดพลาดในการส่งข้อมูล");
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});

// 2. Public Complaints Logic
async function loadComplaints() {
    const list = document.getElementById('complaintsList');
    if (!list) return; // Not on the right page
    
    if (!db) {
        list.innerHTML = '<div class="loading-text">ระบบรับเรื่องยังไม่ได้เชื่อมต่อฐานข้อมูล</div>';
        return;
    }
    
    try {
        const q = query(collection(db, "complaints"), orderBy("timestamp", "desc"));
        
        onSnapshot(q, (querySnapshot) => {
            if (querySnapshot.empty) {
                list.innerHTML = '<div class="loading-text">ยังไม่มีความคิดเห็นในขณะนี้</div>';
                return;
            }
            
            let html = '';
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                let imageHtml = data.imageUrl ? `<img src="${data.imageUrl}" class="comment-attached-image" alt="ภาพแนบ">` : '';
                html += `
                    <div class="comment-item complaint-type-${data.type}">
                        <div class="comment-header">
                            <span class="comment-author"><i class="fa-solid fa-user"></i> ${data.name || 'ประชาชน'} (${data.type})</span>
                            <span class="comment-date">${formatDate(data.timestamp)}</span>
                        </div>
                        <div class="comment-body">
                            ${data.text}
                            ${imageHtml}
                        </div>
                    </div>
                `;
            });
            list.innerHTML = html;
        }, (error) => {
            console.error("Error listening to complaints: ", error);
            // Ignore index errors silently on UI if they occur during dev
        });
    } catch (error) {
        console.error("Error setting up complaints listener: ", error);
    }
}

document.getElementById('complaintForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!db) return alert("Firebase is not initialized.");
    
    const name = document.getElementById('complaintName').value;
    const type = document.getElementById('complaintType').value;
    const text = document.getElementById('complaintText').value;
    const imageFile = document.getElementById('complaintImage').files[0];
    const btn = e.target.querySelector('button');
    const originalText = btn.innerHTML;
    
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> กำลังส่ง...';
    btn.disabled = true;
    
    try {
        let imageUrl = null;
        if (imageFile) {
            imageUrl = await uploadImageAndGetUrl(imageFile, 'complaints');
        }

        await addDoc(collection(db, "complaints"), {
            name: name,
            type: type,
            text: text,
            imageUrl: imageUrl,
            timestamp: serverTimestamp()
        });
        e.target.reset();
        alert("ส่งข้อความเรียบร้อยแล้ว ขอบคุณสำหรับความคิดเห็นครับ");
    } catch (err) {
        console.error("Error adding complaint: ", err);
        alert("เกิดข้อผิดพลาดในการส่งข้อมูล");
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
});
