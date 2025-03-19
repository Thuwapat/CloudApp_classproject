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
  const [imageUrls, setImageUrls] = useState<Record<number, string>>({});
  const [firstName, setFirstName] = useState('User');

  const imagesPerPage = 12;

  const filteredImages = filterDate
    ? images.filter((img) => img.uploaded_at.substring(0, 10) === filterDate)
    : images;

  const indexOfLastImage = currentPage * imagesPerPage;
  const indexOfFirstImage = indexOfLastImage - imagesPerPage;
  const currentImages = filteredImages.slice(indexOfFirstImage, indexOfLastImage);

  const totalPages = Math.ceil(filteredImages.length / imagesPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilterDate(e.target.value);
    setCurrentPage(1);
  };

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
        return;
      } catch (error) {
        console.error(`Attempt ${attempt} - Error fetching image ${id}:`, error);
        if (attempt === retries) {
          console.error(`Failed to fetch image ${id} after ${retries} attempts`);
        }
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  };

  useEffect(() => {
    currentImages.forEach((img) => {
      if (!imageUrls[img.id]) {
        fetchImage(img.id);
      }
    });
  }, [currentImages]);

  useEffect(() => {
    return () => {
      Object.values(imageUrls).forEach((url) => URL.revokeObjectURL(url));
      setImageUrls({});
    };
  }, []);

  const getPaginationRange = () => {
    const maxVisiblePages = 7; 
    const halfVisible = Math.floor(maxVisiblePages / 2); 
    let start = Math.max(1, currentPage - halfVisible);
    let end = Math.min(totalPages, start + maxVisiblePages - 1);


    if (end - start + 1 < maxVisiblePages) {
      start = Math.max(1, end - maxVisiblePages + 1);
    }

    const pages: (number | string)[] = [];
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (start > 1) {
      pages.unshift(1); 
      if (start > 2) {
        pages.splice(1, 0, '...'); 
      }
    }
    if (end < totalPages) {
      if (end < totalPages - 1) {
        pages.push('...'); 
      }
      pages.push(totalPages); 
    }

    return pages;
  };

  return (
    <div className="bg-[#f4e2dc] min-h-screen flex">
        <Header firstName={''}/>
      <ResponsiveSidebar />
      <div className="flex-1 ml-0 sm:ml-64">

        <div className="max-w-6xl mx-auto mt-20 p-6 text-amber-400">
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

        <div className="pagination mt-4 flex justify-center items-center gap-2">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded border border-gray-300 ${
              currentPage === 1 ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            ← Prev
          </button>

          {getPaginationRange().map((page, index) => (
            <button
              key={index}
              onClick={() => typeof page === 'number' && handlePageChange(page)}
              className={`px-3 py-1 rounded border border-gray-300 ${
                page === currentPage
                  ? 'bg-blue-500 text-white'
                  : typeof page === 'number'
                  ? 'text-gray-700 hover:bg-gray-100'
                  : 'text-gray-500 cursor-default'
              }`}
              disabled={typeof page !== 'number'}
            >
              {page}
            </button>
          ))}

          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded border border-gray-300 ${
              currentPage === totalPages ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Next →
          </button>
        </div>
      </div>
    </div>
  );
}



