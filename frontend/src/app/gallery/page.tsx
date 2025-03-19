import React from 'react';
import GalleryClient from './GalleryClient';

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
  const images = data.images.map((img: any) => {
    const date = new Date(img.uploaded_at);
    date.setHours(date.getHours() + 7); // บวก 7 ชั่วโมง
    const localTime = date.toISOString().slice(0, 19).replace('T', ' ');
    return {
      ...img,
      uploaded_at: localTime, 
    };
  });

  return images;
}

export default async function GalleryPage() {
  const images = await getImages();
  return <GalleryClient images={images} />;
}