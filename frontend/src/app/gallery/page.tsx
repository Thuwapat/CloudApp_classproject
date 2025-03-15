// app/gallery/page.tsx
// นี่คือไฟล์ Page ใน Next.js 13 App Router

import React from 'react';
import GalleryClient from './GalleryClient';

// ฟังก์ชันสำหรับดึงข้อมูลจาก API (รันบน Server)
async function getImages() {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API_KEY ไม่ถูกกำหนดใน environment variables");
  }

  const res = await fetch('http://10.161.112.138:5001/allImages', {
    headers: {
      'x-api-key': apiKey,
    },
  });

  console.log('Response status:', res.status, res.statusText);
  if (!res.ok) {
    const errorText = await res.text();
    console.error('Error body:', errorText);
    throw new Error('Failed to fetch images');
  }

  const data = await res.json();
  return data.images;
}
// Page component (Server Component โดยดีฟอลต์)
export default async function GalleryPage() {
  // ดึงข้อมูลจาก API ในฝั่ง Server
  const images = await getImages();

  // ส่งข้อมูลให้ Client Component เพื่อให้สามารถใช้งาน useState/useEffect ได้
  return <GalleryClient images={images} />;
}
