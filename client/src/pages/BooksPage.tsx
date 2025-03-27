import React, { useState, useEffect, useCallback } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import axios from 'axios';
import { CSVLink } from 'react-csv';
import { useTranslation } from 'react-i18next';

type Book = {
  index: number;
  isbn: string;
  title: string;
  author: string;
  publisher: string;
  likes: number;
  reviews: number;
  cover: string;
};

type LanguageOption = {
  label: string;
  value: string;
};

const languageOptions: LanguageOption[] = [
  { label: 'English (USA)', value: 'en-US' },
  { label: 'Russian (Russia)', value: 'ru-RU' },
  { label: 'Polish (Poland)', value: 'pl-PL' },
];

const BooksPage: React.FC = () => {
  const { t, i18n } = useTranslation();

  const [seed, setSeed] = useState<number>(1);
  const [region, setRegion] = useState<string>('en-US');
  const [likes, setLikes] = useState<number>(0);
  const [reviews, setReviews] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'table' | 'gallery'>('table');
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const [books, setBooks] = useState<Book[]>([]);
  const [batch, setBatch] = useState<number>(1);
  const [hasMore, setHasMore] = useState<boolean>(true);

  const fetchBooks = useCallback(
    async (currentBatch: number, reset: boolean = false) => {
      try {
        const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3001';
        const response = await axios.get<Book[]>(
          `${apiUrl}/api/books?seed=${seed}&batch=${currentBatch}&region=${region}&likes=${likes}&reviews=${reviews}`,
        );
        const newBooks = response.data;

        if (currentBatch >= 5 || newBooks.length === 0) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }

        if (reset) {
          setBooks(newBooks);
        } else {
          setBooks((prev) => [...prev, ...newBooks]);
        }
      } catch (error) {
        console.error('Error loading data', error);
      }
    },
    [seed, region, likes, reviews],
  );

  useEffect(() => {
    setBatch(1);
    fetchBooks(1, true);
  }, [seed, region, likes, reviews, fetchBooks]);

  const fetchMoreBooks = () => {
    const nextBatch = batch + 1;
    setBatch(nextBatch);
    fetchBooks(nextBatch);
  };

  const handleRandomSeed = () => {
    const randomValue = Math.floor(Math.random() * 1000) + 1;
    setSeed(randomValue);
  };

  return (
    <div>
      <h1>{t('title')}</h1>
      <div className="flex-container">
        <label>
          {t('region')}:{' '}
          <select
            value={region}
            onChange={(e) => {
              setRegion(e.target.value);
              i18n.changeLanguage(e.target.value.split('-')[0]);
            }}
          >
            {languageOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Seed:{' '}
          <input
            type="number"
            value={seed}
            className="input"
            onChange={(e) => setSeed(Number(e.target.value))}
          />
        </label>
        <button onClick={handleRandomSeed}> {t('random')} Seed</button>
      </div>
      <div className="margin-bottom">
        <label className="flex-container">
          {t('likes')}:<span className="likes">{likes.toFixed(1)}</span>{' '}
          <input
            type="range"
            min="0"
            max="10"
            step="0.1"
            value={likes}
            onChange={(e) => setLikes(parseFloat(e.target.value))}
          />
        </label>
      </div>
      <div className="margin-bottom">
        <label>
          {t('reviews')}:{' '}
          <input
            className="input"
            type="number"
            step="0.1"
            value={reviews}
            onChange={(e) => setReviews(parseFloat(e.target.value))}
          />
        </label>
      </div>
      <div>
        <div className="flex-container">
          <button onClick={() => setViewMode('table')}>{t('table')}</button>
          <button onClick={() => setViewMode('gallery')}>{t('gallery')}</button>
          <CSVLink
            data={books}
            filename={`books_seed_${seed}.csv`}
            className="btn btn-primary"
            target="_blank"
          >
            {t('export')} CSV
          </CSVLink>
        </div>
        <div className="margin-top">
          {viewMode === 'table' ? (
            <InfiniteScroll
              dataLength={books.length}
              next={fetchMoreBooks}
              hasMore={hasMore}
              loader={<h4>Загрузка...</h4>}
              height={400}
            >
              <table border={1} cellPadding={8}>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>ISBN</th>
                    <th>{t('name')}</th>
                    <th>{t('author')}</th>
                    <th>{t('publishing')}</th>
                    <th>{t('likesCount')}</th>
                    <th>{t('reviewsCount')}</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr
                      key={book.index}
                      onClick={() => setSelectedBook(book)}
                      className="pointer"
                    >
                      <td>{book.index}</td>
                      <td>{book.isbn}</td>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>{book.publisher}</td>
                      <td>{book.likes}</td>
                      <td>{book.reviews}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </InfiniteScroll>
          ) : (
            <div className="gallery-container">
              {books.map((book) => (
                <div key={book.index} className="gallery">
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="gallery-img"
                  />
                  <div className="gallery-text">
                    <h3>{book.title}</h3>
                    <p>
                      {t('author')}: {book.author}
                    </p>
                    <p>
                      {t('publishing')}: {book.publisher}
                    </p>
                    <p>
                      {t('likesCount')}: {book.likes}
                    </p>
                    <p>
                      {t('reviewsCount')}: {book.reviews}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {selectedBook && (
        <div className="selectedBookModal">
          <div className="selectedBookModalContent">
            <h2>{t('details')}</h2>
            <p>
              <strong>{t('name')}:</strong> {selectedBook.title}
            </p>
            <p>
              <strong>{t('author')}:</strong> {selectedBook.author}
            </p>
            <p>
              <strong>{t('publishing')}:</strong> {selectedBook.publisher}
            </p>
            <p>
              <strong>ISBN:</strong> {selectedBook.isbn}
            </p>
            <p>
              <strong>{t('likesCount')}:</strong> {selectedBook.likes}
            </p>
            <p>
              <strong>{t('reviewsCount')}:</strong> {selectedBook.reviews}
            </p>
            <button
              className="selectedBookModal__button"
              onClick={() => setSelectedBook(null)}
            >
              {t('close')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default BooksPage;
