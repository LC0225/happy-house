'use client';

interface FilterBarProps {
  countries: string[];
  years: string[];
  genres: string[];
  tags: string[];
  selectedCountry: string;
  selectedYear: string;
  selectedGenre: string;
  selectedTag: string;
  onCountryChange: (value: string) => void;
  onYearChange: (value: string) => void;
  onGenreChange: (value: string) => void;
  onTagChange: (value: string) => void;
}

export default function FilterBar({
  countries,
  years,
  genres,
  tags,
  selectedCountry,
  selectedYear,
  selectedGenre,
  selectedTag,
  onCountryChange,
  onYearChange,
  onGenreChange,
  onTagChange,
}: FilterBarProps) {
  return (
    <div className="space-y-6">
      {/* 国家筛选 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          国家/地区
        </label>
        <div className="flex flex-wrap gap-2">
          {countries.map(country => (
            <button
              key={country}
              onClick={() => onCountryChange(country)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedCountry === country
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
              }`}
            >
              {country}
            </button>
          ))}
        </div>
      </div>

      {/* 年份筛选 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          年份
        </label>
        <div className="flex flex-wrap gap-2">
          {years.map(year => (
            <button
              key={year}
              onClick={() => onYearChange(year)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedYear === year
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
              }`}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      {/* 题材筛选 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          题材
        </label>
        <div className="flex flex-wrap gap-2">
          {genres.map(genre => (
            <button
              key={genre}
              onClick={() => onGenreChange(genre)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedGenre === genre
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* 标签筛选 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          标签
        </label>
        <div className="flex flex-wrap gap-2">
          {tags.map(tag => (
            <button
              key={tag}
              onClick={() => onTagChange(tag)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                selectedTag === tag
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-purple-100'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
