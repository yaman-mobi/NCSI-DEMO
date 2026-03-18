import { useState } from 'react';
import { Link } from 'react-router-dom';

const categories = [
  { title: 'Labor Market', category: 'Labor Market', image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&h=458&fit=crop&auto=format&q=80' },
  { title: 'Population', category: 'Demographics', image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=800&h=458&fit=crop&auto=format&q=80' },
  // More stable education image (classroom in Oman-like setting)
  { title: 'Education', category: 'Education', image: 'https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?w=800&h=458&fit=crop&auto=format&q=80' },
  { title: 'Vital Statistics', category: 'Vital Statistics', image: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=800&h=458&fit=crop&auto=format&q=80' },
  { title: 'National Accounts', category: 'Economy', image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=458&fit=crop&auto=format&q=80' },
  { title: 'Health', category: 'Health', image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&h=458&fit=crop&auto=format&q=80' },
];

const CARDS_PER_PAGE = 3;
const totalPages = Math.ceil(categories.length / CARDS_PER_PAGE);

export default function CategoryCards() {
  const [page, setPage] = useState(0);
  const slice = categories.slice(page * CARDS_PER_PAGE, page * CARDS_PER_PAGE + CARDS_PER_PAGE);

  const goPrev = () => setPage((p) => (p <= 0 ? totalPages - 1 : p - 1));
  const goNext = () => setPage((p) => (p >= totalPages - 1 ? 0 : p + 1));

  return (
    <section id="categories" className="flex w-full shrink-0 flex-col items-center gap-[30px] bg-portal-bg-alt px-[100px] py-[80px]">
      <div className="text-center">
        <h2 className="font-display text-[30px] font-extrabold leading-[50px] tracking-[-0.5px] text-[#161616]">
          Main Statistical Categories
        </h2>
        <p className="mt-2 max-w-[668px] text-center text-base font-medium leading-[35px] text-portal-gray">
          Explore comprehensive data across key sectors of Oman&apos;s economy and society
        </p>
      </div>
      <div className="grid w-full max-w-[1240px] grid-cols-3 gap-6">
        {slice.map((cat) => (
          <Link
            key={cat.title}
            to={`/datasets?category=${encodeURIComponent(cat.category)}`}
            className="relative flex h-[229px] flex-1 flex-col items-center justify-center rounded-[10px] px-6 overflow-hidden group"
          >
            <img
              src={cat.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover rounded-[10px] group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 rounded-[10px] bg-black/53" />
            <span className="relative z-10 text-center text-[22px] font-bold text-white drop-shadow-[0_0_4px_rgba(0,0,0,0.2)]">
              {cat.title}
            </span>
          </Link>
        ))}
      </div>
      <div className="flex w-full max-w-[1240px] items-center justify-between">
        <div className="flex gap-4">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i)}
              className={`h-4 w-4 rounded-xl ${page === i ? 'bg-portal-blue' : 'bg-portal-blue/10'}`}
              aria-label={`Page ${i + 1}`}
            />
          ))}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={goPrev}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-portal-blue/10 text-portal-blue hover:bg-portal-blue/20"
            aria-label="Previous"
          >
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/></svg>
          </button>
          <button
            type="button"
            onClick={goNext}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-portal-blue text-white hover:bg-portal-blue/90"
            aria-label="Next"
          >
            <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/></svg>
          </button>
        </div>
      </div>
    </section>
  );
}
