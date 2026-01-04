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
    <div className="bg-white rounded-lg shadow-md p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 国家筛选 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            国家/地区
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => onCountryChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {countries.map(country => (
              <option key={country} value={country}>
                {country}
              </option>
            ))}
          </select>
        </div>

        {/* 年份筛选 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            年份
          </label>
          <select
            value={selectedYear}
            onChange={(e) => onYearChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {years.map(year => (
              <option key={year} value={year}>
                {year}
              </option>
            ))}
          </select>
        </div>

        {/* 题材筛选 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            题材
          </label>
          <select
            value={selectedGenre}
            onChange={(e) => onGenreChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {genres.map(genre => (
              <option key={genre} value={genre}>
                {genre}
              </option>
            ))}
          </select>
        </div>

        {/* 标签筛选 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            标签
          </label>
          <select
            value={selectedTag}
            onChange={(e) => onTagChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {tags.map(tag => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
