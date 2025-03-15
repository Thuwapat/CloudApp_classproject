'use client';

import React, { useState, useEffect } from 'react';
import ResponsiveSidebar from '@/components/ui/responsidebar';
import Header from '@/components/header';

interface ImageData {
  id: number;
  filename: string;
  uploaded_at: string;
}

interface GalleryClientProps {
  images: ImageData[];
}

export default function GalleryClient({ images }: GalleryClientProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [filterDate, setFilterDate] = useState('');
  const [imageUrls, setImageUrls] = useState<Record<number, string>>({}); // เก็บ URL ของรูปภาพ
  const [firstName, setFirstName] = useState('User');

  // จำนวนรูปต่อหน้า
  const imagesPerPage = 12;

  // ฟิลเตอร์รูปตามวันที่ (รูปแบบ: YYYY-MM-DD)
  const filteredImages = filterDate
    ? images.filter((img) => img.uploaded_at.substring(0, 10) === filterDate)
    : images;

  // คำนวณรูปที่จะนำมาแสดงในหน้าปัจจุบัน
  const indexOfLastImage = currentPage * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImages = filteredImages.slice(indexOfFirstImage, indexOfLastImage);

  // จำนวนหน้าทั้งหมด
  const totalPages = Math.ceil(filteredImages.length / imagesPerPage);

  // เปลี่ยนหน้า
  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // เมื่อเปลี่ยนวันที่ใน input
  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterDate(e.target.value);
    setCurrentPage(1);
  };

  // ดึงรูปภาพจาก API โดยใช้ API_KEY
  const fetchImage = async (id: number, retries = 3) => {
    const apiKey = process.env.NEXT_PUBLIC_API_KEY_IMAGE;
    if (!apiKey) {
      console.error('API_KEY is not defined');
      return;
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(`http://10.161.112.138:5001/image/${id}`, {
          headers: {
            'x-api-key': apiKey,
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch image ${id}: ${response.status} ${response.statusText}`);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setImageUrls((prev) => ({ ...prev, [id]: url }));
        return; // ดึงสำเร็จ ออกจาก loop
      } catch (error) {
        console.error(`Attempt ${attempt} - Error fetching image ${id}:`, error);
        if (attempt === retries) {
          console.error(`Failed to fetch image ${id} after ${retries} attempts`);
        }
        await new Promise((resolve) => setTimeout(resolve, 1000)); // รอ 1 วินาทีก่อน retry
      }
    }
  };

  // ดึงรูปภาพทั้งหมดเมื่อ component ถูก mount หรือ currentImages เปลี่ยน
  useEffect(() => {
    currentImages.forEach((img) => {
      if (!imageUrls[img.id]) {
        fetchImage(img.id);
      }
    });
  }, [currentImages]); // ไม่ต้องพึ่ง imageUrls เพื่อป้องกัน loop

  // คลีนอัพ Blob URL เฉพาะเมื่อ component unmount
  useEffect(() => {
    return () => {
      Object.values(imageUrls).forEach((url) => URL.revokeObjectURL(url));
      setImageUrls({}); // รีเซ็ต imageUrls เมื่อ unmount
    };
  }, []); // ทำงานเฉพาะตอน unmount

  return (
    <div className="bg-amber-50 min-h-screen flex">
      <Header firstName={''} />
      <ResponsiveSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-0 sm:ml-64">
        <div className="max-w-6xl mx-auto mt-20 p-6">
          {/* Filter (อยู่ด้านบนขวา) */}
          <div className="flex justify-end items-center gap-5 mb-6">
            <label htmlFor="filterDate" className="text-gray-700">
              เลือกวันที่:
            </label>
            <input
              type="date"
              id="filterDate"
              name="filterDate"
              value={filterDate}
              onChange={handleFilterChange}
              className="border border-gray-300 rounded p-2"
            />
          </div>

          {/* Gallery (Grid รูปภาพ) */}
          <div className="border-gray-200 p-6 rounded-lg">
            {currentImages.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {currentImages.map((img) => (
                  <div
                    key={img.id}
                    className="bg-white rounded-xl shadow-md overflow-hidden transform hover:scale-105 transition duration-300"
                  >
                    <img
                      src={imageUrls[img.id] || '/placeholder.jpg'}
                      alt={`Image ${img.id}`}
                      className="w-full h-40 object-cover"
                      loading="lazy"
                      onError={(e) => {
                        console.error(`Failed to load image ${img.id}`);
                        e.currentTarget.src = '/placeholder.jpg';
                      }}
                    />
                    <div className="p-4">
                      <p className="text-gray-600 text-sm">{img.uploaded_at}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No images available.</p>
            )}
          </div>
        </div>

        {/* Pagination */}
        <div className="pagination mt-4 flex justify-center">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`mx-1 px-3 py-1 rounded ${
                currentPage === index + 1
                  ? 'bg-gray-400 text-white'
                  : 'bg-white text-gray-700'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}