'use client';

import React, { useState } from 'react';
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
  const [firstName, setFirstName] = useState('User');

  // จำนวนรูปต่อหน้า
  const imagesPerPage = 12;

  // ฟิลเตอร์รูปตามวันที่ (รูปแบบ: YYYY-MM-DD)
  const filteredImages = filterDate
    ? images.filter(
      (img) => img.uploaded_at.substring(0, 10) === filterDate
    )
    : images;

  // คำนวณรูปที่จะนำมาแสดงในหน้าปัจจุบัน
  const indexOfLastImage = currentPage * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImages = filteredImages.slice(
    indexOfFirstImage,
    indexOfLastImage
  );

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

  return (
    <div className="bg-[#f4e2dc] min-h-screen flex">
      {/* Responsive Sidebar */}

        <Header firstName={''}/>
      <ResponsiveSidebar />

      {/* Main Content */}
      <div className="flex-1 ml-0 sm:ml-64">
        {/* Header (อาจเป็นแบบ fixed ถ้าต้องการ ให้ปรับ padding-top ของ Main Content ด้วย) */}
        {/* <Header firstName={firstName} /> */}

        {/* Container สำหรับ Filter และ Gallery (จัดให้อยู่ใน container เดียวกันเพื่อให้ alignment ตรงกัน) */}
        <div className="max-w-6xl mx-auto mt-20 p-6 text-amber-400">
          {/* Filter (อยู่ด้านบนขวา) */}
          <div className="flex justify-end items-center gap-5 mb-6">
            <label htmlFor="filterDate" className="text-gray-700">
            Filter:
            </label>
            <input
              type="date"
              id="filterDate"
              name="filterDate"
              value={filterDate}
              onChange={handleFilterChange}
              className="border border-white rounded p-2 text-gray-900"
            />
          </div>

          {/* Gallery (Grid รูปภาพ) */}
          <div className="border-gray-200 p-6 rounded-lg">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {currentImages.map((img) => (
                <div
                  key={img.id}
                  className="bg-white rounded-xl shadow-md overflow-hidden transform hover:scale-105 transition duration-300"
                >
                  <img

                    src={img.filename} // ใช้ URL เต็มที่ได้รับจาก API โดยตรง
                    alt={`Image ${img.id}`}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <p className="text-gray-600 text-sm">
                      {img.uploaded_at}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pagination */}
        <div className="pagination mt-4 flex justify-center">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index + 1}
              onClick={() => handlePageChange(index + 1)}
              className={`mx-1 px-3 py-1 rounded ${currentPage === index + 1
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


