import React from 'react';
import GalleryClient from './GalleryClient';

// ฟังก์ชันสำหรับดึงข้อมูลจาก API (รันบน Server)
async function getImages() {
  const apiKey = process.env.NEXT_PUBLIC_API_KEY_IMAGE;
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
  // แปลง uploaded_at ให้เป็น +7 ในฝั่ง Server
  const images = data.images.map((img: any) => {
    const date = new Date(img.uploaded_at);
    date.setHours(date.getHours() + 7); // บวก 7 ชั่วโมง
    const localTime = date.toISOString().slice(0, 19).replace('T', ' '); // รูปแบบ "YYYY-MM-DD HH:mm:ss"
    return {
      ...img,
      uploaded_at: localTime, // อัปเดต uploaded_at เป็นเวลาท้องถิ่น +7
    };
  });

  return images;
}

// Page component (Server Component โดยดีฟอลต์)
export default async function GalleryPage() {
  const images = await getImages();
  return <GalleryClient images={images} />;
}